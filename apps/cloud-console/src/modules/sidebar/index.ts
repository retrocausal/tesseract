import mockRandomUpdates from "@cloud-mocks/socket";
import type { default as N_Ary } from "@platform/types/interfaces/n-ary.interface";
import type {
  NavItem,
  NavData,
  Scaffolder,
  Scaffolding,
} from "@cloud-types/sidebar";
import { default as EventPubSubProvider } from "@cloud-utils/emitter";
import { render, setSelected } from "@cloud-modules/sidebar/view";
import { propagateState as PropagateNAVState } from "@cloud-modules/sidebar/utils/nav-utils";
import {
  onclick,
  onStatusChange,
} from "@cloud-modules/sidebar/utils/listeners";
import type { RouteIdentifier } from "@cloud-constants/router.const";
import { CLOUD_CONSOLE_ROUTE_KEYS } from "@cloud-constants/router.const";

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

async function initialiseConsole(arg: Scaffolding): Promise<NavData> {
  const { tree, container } = arg;
  let state: Set<string> | undefined,
    list = null;
  if (container) {
    const rootNode = tree?.root;
    state = new Set<string>();
    if (rootNode) {
      list = render(rootNode, state);
      container?.append(list);
      list?.addEventListener("click", (e) => onclick(e, tree.nodes, state));
      list?.addEventListener(onStatusReception, onStatusChange);
    }
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
    .then(initialiseConsole);
}

async function run(data: NavData) {
  const { state, tree, root } = data;
  if (state && tree && root) {
    attachStateChangeListeners(tree);
    mockRandomUpdates(tree);
    function hydrateStateFromURL(resourceID: string) {
      if (resourceID) {
        const lineage = tree?.lineage(resourceID);
        if (lineage) {
          for (let i = lineage.length - 1; i > -1; i--) {
            const resource = lineage[i];
            state?.add(resource.id);
          }
        }
        setSelected(resourceID);
      }
    }
    return hydrateStateFromURL;
  }
}

async function enrollURIChangeListener(
  fn: ((resourceID: string) => void) | undefined,
) {
  if (fn) {
    const module = await import("@cloud-router/index");
    const AppRouter = module?.default;
    const key: RouteIdentifier = CLOUD_CONSOLE_ROUTE_KEYS.RES_ID;
    AppRouter?.registerURIChangeListeners(fn, key);
  }
}

export function onload(navInitializer: Scaffolder) {
  if (navInitializer) {
    Promise.resolve(navInitializer)
      .then(bootstrap)
      .then(run)
      .then(enrollURIChangeListener)
      .catch((e) => {
        console.warn(e);
      });
  }
}

/**
 * 
 * 
      .then(attachEventListeners)
.then(mockRandomUpdates)
      .then(attachStateChangeListeners)

      const URI = new URL(window?.location?.href);
      const pathName = URI?.pathname;
      let resourceID;
      if (pathName && pathName.includes("/resource/")) {
        resourceID = hydrateStateFromURL(state, tree, URI);
      }
      if (resourceID) {
        setSelected(resourceID);
      }
 */

/**
       * 
       * 

       */
