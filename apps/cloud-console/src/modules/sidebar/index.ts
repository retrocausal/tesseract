import mockRandomUpdates from "@cloud-mocks/socket";
import type { default as N_Ary } from "@platform/types/interfaces/n-ary.interface";
import { default as Tree } from "@platform/structures/n-ary.struct";
import type {
  NavItem,
  EventBinder,
  BootstrapConfig,
} from "@cloud-types/sidebar";
import { default as EventPubSubProvider } from "@cloud-utils/emitter";
import { render, setSelected } from "@cloud-modules/sidebar/view";
import { propagateState as PropagateNAVState } from "@cloud-modules/sidebar/utils/nav-utils";
import {
  onclick,
  onStatusChange,
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

function subscribe(tree: N_Ary<NavItem> | undefined) {
  if (tree) {
    const { nodes } = tree;
    EventPubSubProvider.subscribe("status:update", (payload) => {
      const propagations = PropagateNAVState(payload, nodes);
      for (const [id, status] of propagations) {
        dispatchStatusUpdate(id, status);
      }
    });
  }
}

function hydrateStateFromURL(
  state: Set<string>,
  tree: N_Ary<NavItem>,
  URI: URL
): string | undefined {
  let resourceID;
  const pathFragments = URI?.pathname?.split("/resource/").filter((p) => !!p);
  if (pathFragments.length === 2) {
    resourceID = pathFragments.pop();
    if (resourceID) {
      const lineage = tree?.lineage(resourceID);
      for (let i = lineage.length - 1; i > -1; i--) {
        const resource = lineage[i];
        state?.add(resource.id);
      }
    }
  }
  return resourceID;
}

function present(config: BootstrapConfig): EventBinder {
  const { data, container } = config;
  let state,
    list = null;
  const tree = Tree.from(data);
  if (container) {
    const rootNode = tree?.root;
    if (rootNode) {
      state = new Set<string>();
      const URI = new URL(window?.location?.href);
      const pathName = URI?.pathname;
      let resourceID;
      if (pathName && pathName.includes("/resource/")) {
        resourceID = hydrateStateFromURL(state, tree, URI);
      }
      list = render(rootNode, state);
      container?.append(list);
      if (resourceID) {
        setSelected(resourceID);
      }
    }
  }
  return { state, tree, parent: list };
}

function attachEventListeners(arg: EventBinder): N_Ary<NavItem> | undefined {
  const { tree, parent, state } = arg;
  if (tree && state) {
    parent?.addEventListener("click", (e) => onclick(e, tree.nodes, state));
    parent?.addEventListener(onStatusReception, onStatusChange);
    return tree;
  }
}

export function onload(navData: BootstrapConfig) {
  if (navData) {
    Promise.resolve(navData)
      .then(present)
      .then(attachEventListeners)
      .then(mockRandomUpdates)
      .then(subscribe)
      .catch((e) => {
        console.warn(e);
      });
  }
}
