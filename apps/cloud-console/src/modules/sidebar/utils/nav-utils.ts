import type { N_ary_Node } from "@tesseract/platform/types/interfaces/n-ary.interface";
import { type NavItem } from "@cloud-types/nav.ui.types";
import { type StatusDispatch } from "@cloud-types/emitter.ui.types";
import N_Ary from "@tesseract/platform/types/interfaces/n-ary.interface";

const STATUS_SEV_INDICES = ["active", "booting", "degraded", "offline"];

function computeState(node: N_ary_Node<NavItem>) {
  const { children } = node;
  const currentState = node.value.status;
  let state: NavItem["status"] = currentState;
  let maxSevIndex = 0;
  for (const child of children) {
    if (maxSevIndex === STATUS_SEV_INDICES.length - 1) break;
    if (
      child.value.status &&
      STATUS_SEV_INDICES.indexOf(child.value.status) > maxSevIndex
    ) {
      maxSevIndex = STATUS_SEV_INDICES.indexOf(child.value.status);
    }
  }
  if (node.value.status !== STATUS_SEV_INDICES[maxSevIndex]) {
    state = STATUS_SEV_INDICES[maxSevIndex] as NavItem["status"];
  }
  return state;
}

export function harmonize(tree: N_Ary<NavItem>) {
  const reconcileState = (node: N_ary_Node<NavItem>) => {
    if (node.children && node.children.length) {
      for (const child of node.children) {
        reconcileState(child);
      }
      node.value.status = computeState(node);
    }
  };
  if (tree.root) reconcileState(tree.root);
  return tree;
}

export const propagateState = (
  payload: StatusDispatch,
  nodes: Map<string, N_ary_Node<NavItem>>,
) => {
  const { id, status } = payload;
  const propagatedUpdates: Map<string, string> = new Map();
  if (nodes.has(id)) {
    const node = nodes.get(id);
    if (node) {
      let current: string | null | undefined = node.parentId;
      const receivedState = status as NavItem["status"];
      node.value.status = receivedState;
      propagatedUpdates.set(id, receivedState);
      while (current) {
        const parent = nodes.get(current);
        if (parent) {
          const parentState =
            parent.value?.status || ("active" as NavItem["status"]);
          let newParentState;
          if (
            STATUS_SEV_INDICES.indexOf(receivedState) >
            STATUS_SEV_INDICES.indexOf(parentState)
          ) {
            newParentState = receivedState;
          } else {
            newParentState = computeState(parent);
          }
          if (parent && newParentState && newParentState !== parentState) {
            parent.value.status = newParentState as NavItem["status"];
            propagatedUpdates.set(current, newParentState);
          }
          current = parent?.parentId;
        } else {
          current = null;
          break;
        }
      }
    }
  }
  return propagatedUpdates;
};

export function toggleNavState(id: string, state: Set<string>) {
  const op = state.has(id) ? "delete" : "add";
  state[op]?.(id);
}
