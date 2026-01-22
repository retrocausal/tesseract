import mockRandomUpdates from "@cloud-mocks/socket";
import type { default as N_Ary } from "@platform/types/interfaces/n-ary.interface";
import type {
  NavItem,
  NavData,
  Scaffolder,
  Scaffolding,
  RouterPlugs,
} from "@cloud-types/sidebar";
import { default as EventPubSubProvider } from "@cloud-utils/emitter";
import { render } from "@cloud-modules/sidebar/view";
import { propagateState as PropagateNAVState } from "@cloud-modules/sidebar/utils/nav-utils";
import {
  onclick,
  onStatusChange,
  hydrateStateFromURL,
} from "@cloud-modules/sidebar/utils/listeners";
import type {
  RouteUpdate,
  RouteIdentifier,
  Subscriber,
} from "@cloud-types/router.types";
import { ROUTE_KEYS } from "@cloud-types/router.types";
import type { Resolver } from "@cloud-types/router.types";

export const onStatusReception = "OnStatusChange";

function dispatchStatusUpdate(id: string, status: string) {
  const element = document.getElementById(id);
  if (element) {
    const event = new CustomEvent(onStatusReception, {
      detail: { id, status },
      bubbles: true,
    });
    element.dispatchEvent(event);
  }
}

function attachStateChangeListeners(tree: N_Ary<NavItem>) {
  const { nodes } = tree;
  EventPubSubProvider.subscribe("status:update", (payload) => {
    const propagations = PropagateNAVState(payload, nodes);
    for (const [id, status] of propagations) {
      dispatchStatusUpdate(id, status);
    }
  });
}

async function initNav(arg: Scaffolding): Promise<NavData> {
  const { tree, container } = arg;
  let state: Set<string> | undefined,
    list = null;
  const rootNode = tree?.root;
  if (container && rootNode) {
    state = new Set<string>();
    list = render(rootNode, state);
    container?.append(list);
    list?.addEventListener("click", onclick);
    list?.addEventListener(onStatusReception, onStatusChange);
  }
  return { state, tree, root: list };
}

async function bootstrap(arg: Scaffolder) {
  return import("@platform/structures/n-ary.struct")
    .then((module) => module.default)
    .then((NaryTree) => ({
      tree: NaryTree?.from(arg?.data),
      container: arg?.container,
    }))
    .then(initNav);
}

async function run(data: NavData) {
  const { state, tree, root } = data;
  let onURIChange: Resolver | undefined;
  if (state && tree && root) {
    attachStateChangeListeners(tree);
    mockRandomUpdates(tree);
    onURIChange = (id: string) => hydrateStateFromURL(id, tree, state);
  }
  return { onURIChange };
}

async function subscribeToRouterUpdates<A extends RouterPlugs>(listenerMap: A) {
  const { onURIChange, onRouteUpdate } = listenerMap;
  const module = await import("@cloud-router/index");
  const AppRouter = module?.default;
  if (onURIChange) {
    const key: RouteIdentifier = ROUTE_KEYS.RESOURCE;
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
        console.warn(e);
      });
  }
  return Promise.reject();
}
