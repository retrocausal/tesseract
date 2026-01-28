import type { N_ary_Node } from "@platform/types/interfaces/n-ary.interface";
import { CloudConsole } from "@schema";

const STATUS_SEV_INDICES = ["active", "booting", "degraded", "offline"];

export const propagateState = (
  payload: CloudConsole.StatusDispatch,
  nodes: Map<string, N_ary_Node<CloudConsole.NavItem>>,
) => {
  const { id, status } = payload;
  const propagatedUpdates: Map<string, string> = new Map();
  if (nodes.has(id)) {
    const node = nodes.get(id);
    if (node) {
      let current: string | null | undefined = node.parentId;
      const receivedState = status as CloudConsole.NavItem["status"];
      node.value.status = receivedState;
      propagatedUpdates.set(id, receivedState);
      while (current) {
        const parent = nodes.get(current);
        if (parent) {
          const parentState =
            parent.value?.status ||
            ("active" as CloudConsole.NavItem["status"]);
          let newParentState;
          if (
            STATUS_SEV_INDICES.indexOf(receivedState) >
            STATUS_SEV_INDICES.indexOf(parentState)
          ) {
            newParentState = receivedState;
          } else {
            const { children } = parent;
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
            if (parent.value.status !== STATUS_SEV_INDICES[maxSevIndex]) {
              newParentState = STATUS_SEV_INDICES[maxSevIndex];
            }
          }
          if (parent && newParentState && newParentState !== parentState) {
            parent.value.status =
              newParentState as CloudConsole.NavItem["status"];
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
