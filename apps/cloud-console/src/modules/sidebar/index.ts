import { fetchInfrastructureNav } from "@cloud/mocks/nav";
import mockRandomUpdates from "@cloud/mocks/socket";
import N_Ary from "@common-types/interfaces/n-ary.interface";
import type { NavItem } from "@cloud/types/sidebar";
import { default as EventPubSubProvider } from "@cloud/utils/emitter";
import { present, EVENTID } from "@cloud/modules/sidebar/view";

const STATUS_SEV_INDICES = ["active", "booting", "degraded", "offline"];

function dispatchStatusUpdate(id: string, status: string) {
  const element = document.getElementById(id);
  if (element) {
    const event = new CustomEvent(EVENTID, {
      detail: { id, status },
      bubbles: true,
    });
    element.dispatchEvent(event);
  }
}

function subscribe(tree: N_Ary<NavItem>) {
  const { nodes } = tree;
  EventPubSubProvider.subscribe("status:update", (payload) => {
    const { id, status } = payload;
    if (nodes.has(id)) {
      const node = nodes.get(id);
      if (node) {
        let current: string | null | undefined = node.parentId;
        const receivedState = status as NavItem["status"];
        node.value.status = receivedState;
        dispatchStatusUpdate(id, receivedState);
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
              parent.value.status = newParentState as NavItem["status"];
              dispatchStatusUpdate(current, newParentState);
            }
            current = parent?.parentId;
          } else {
            current = null;
            break;
          }
        }
      }
    }
  });
}

export function onload() {
  fetchInfrastructureNav()
    .then(present)
    .then(mockRandomUpdates)
    .then(subscribe)
    .catch((e) => {
      console.warn(e);
    });
}
