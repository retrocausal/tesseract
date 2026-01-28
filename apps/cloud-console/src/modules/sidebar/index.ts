import mockRandomUpdates from "@cloud-mocks/socket";
import type { default as N_Ary } from "@tesseract/platform/types/interfaces/n-ary.interface";
import { CloudConsole } from "@tesseract/schema";
import { default as EventPubSubProvider } from "@cloud-utils/emitter";
import { render } from "@cloud-modules/sidebar/view";
import { propagateState as PropagateNAVState } from "@cloud-modules/sidebar/utils/nav-utils";
import {
  onclick,
  onStatusChange,
  hydrateStateFromURL,
} from "@cloud-modules/sidebar/utils/listeners";

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

function attachStateChangeListeners(tree: N_Ary<CloudConsole.NavItem>) {
  const { nodes } = tree;
  EventPubSubProvider.subscribe("status:update", (payload) => {
    const propagations = PropagateNAVState(payload, nodes);
    for (const [id, status] of propagations) {
      dispatchStatusUpdate(id, status);
    }
  });
}

async function initNav(
  arg: CloudConsole.NavScaffolding,
): Promise<CloudConsole.NavData> {
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

async function bootstrap(arg: CloudConsole.Scaffolder) {
  return import("@tesseract/platform/structures/n-ary.struct")
    .then((module) => module.default)
    .then((NaryTree) => ({
      tree: NaryTree?.from(arg?.data),
      container: arg?.container,
    }))
    .then(initNav);
}

async function run(data: CloudConsole.NavData) {
  const { state, tree, root } = data;
  let onURIChange: CloudConsole.Resolver | undefined;
  if (state && tree && root) {
    attachStateChangeListeners(tree);
    mockRandomUpdates(tree);
    onURIChange = (id: string) => hydrateStateFromURL(id, tree, state);
  }
  return { onURIChange };
}

async function subscribeToRouterUpdates<A extends CloudConsole.RouterPlugs>(
  listenerMap: A,
) {
  const { onURIChange, onRouteUpdate } = listenerMap;
  const module = await import("@cloud-router/index");
  const AppRouter = module?.default;
  if (onURIChange) {
    const key: CloudConsole.RouteIdentifier = CloudConsole.ROUTE_KEYS.RESOURCE;
    AppRouter?.registerURIChangeListeners(onURIChange, key);
  }
  if (onRouteUpdate) {
    AppRouter?.subscribe("cloud:route:update", onRouteUpdate);
  }
}

export function onload(navInitializer: CloudConsole.Scaffolder) {
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
