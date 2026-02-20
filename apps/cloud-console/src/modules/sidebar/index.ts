import { ConsoleSchema } from "@tesseract/schema";
import { default as EventPubSubProvider } from "@cloud-utils/emitter";
import { render } from "@cloud-modules/sidebar/view";
import N_Ary from "@tesseract/platform/types/interfaces/n-ary.interface";
import {
  onclick,
  hydrateStateFromURL,
} from "@cloud-modules/sidebar/utils/listeners";
import {
  propagateState as PropagateNAVState,
  harmonize,
} from "@cloud-modules/sidebar/utils/nav-utils";
import {
  type NavScaffolding,
  type NavData,
  type Scaffolder,
  type RouterPlugs,
  type NavItem,
} from "@cloud-types/nav.ui.types";
import {
  type RouteIdentifier,
  type Resolver,
} from "@cloud-types/router.ui.types";
import { setStatusClass } from "@cloud-modules/sidebar/view";

async function initNav(arg: NavScaffolding): Promise<NavData> {
  const { tree, container } = arg;
  let state: Set<string> | undefined,
    list = null;
  const rootNode = tree?.root;
  if (container && rootNode) {
    state = new Set<string>();
    list = render(rootNode, state);
    container?.append(list);
    list?.addEventListener("click", onclick);
  }
  return { state, tree, root: list };
}

async function bootstrap(arg: Scaffolder) {
  return import("@tesseract/platform/structures/n-ary.struct")
    .then((module) => module.default)
    .then((NaryTree) => ({
      tree: harmonize(NaryTree.from(arg.data)),
      container: arg.container,
    }))
    .then(initNav);
}

function attachStateChangeListeners(tree: N_Ary<NavItem>) {
  const { nodes } = tree;
  let rafId: null | number = null;
  let bufferedUpdates: Map<string, string> = new Map();
  EventPubSubProvider.subscribe("status:update", (payload) => {
    const propagations = PropagateNAVState(payload, nodes);
    for (const [id, status] of propagations) {
      bufferedUpdates.set(id, status);
    }
    const frame = () => {
      for (const [id, status] of bufferedUpdates) {
        const element = document.getElementById(id);
        element && setStatusClass(element, status);
      }
      rafId = null;
      bufferedUpdates.clear();
    };
    if (!rafId) {
      rafId = requestAnimationFrame(frame);
    }
  });
}

async function run(data: NavData) {
  const { state, tree, root } = data;
  let onURIChange: Resolver | undefined;
  if (state && tree && root) {
    attachStateChangeListeners(tree);
    onURIChange = (id: string) => hydrateStateFromURL(id, tree, state);
  }
  return { onURIChange };
}

async function subscribeToRouterUpdates<A extends RouterPlugs>(listenerMap: A) {
  const { onURIChange, onRouteUpdate } = listenerMap;
  const module = await import("@cloud-router/index");
  const AppRouter = module?.default;
  if (onURIChange) {
    const key: RouteIdentifier = ConsoleSchema.ROUTE_KEYS.RESOURCE;
    AppRouter?.registerURIChangeListeners(onURIChange, key);
  }
  if (onRouteUpdate) {
    AppRouter?.subscribe("cloud:route:update", onRouteUpdate);
  }
}

export function onload(navInitializer: Scaffolder) {
  if (navInitializer) {
    return bootstrap(navInitializer)
      .then(run)
      .then(subscribeToRouterUpdates)
      .catch((e) => {
        console.error(e);
      });
  }
  return Promise.reject();
}
