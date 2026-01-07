import { fetchInfrastructureNav } from "@cloud/mocks/nav";
import mockRandomUpdates from "@cloud/mocks/socket";
import { default as Tree } from "@common-struct/n-ary";
import N_Ary, { N_ary_Node } from "@common-types/interfaces/n-ary.interface";
import type { NavItem } from "@cloud/types/sidebar";
import { default as EventPubSubProvider } from "@cloud/modules/emitter";

const EVENTID = "OnStatusChange";
// Define known statuses to allow easy cleanup
const STATUS_CLASSES = [
  "status-active",
  "status-degraded",
  "status-offline",
  "status-booting",
];

const STATUS_SEV_INDICES = ["active", "booting", "degraded", "offline"];

export function onload() {
  fetchInfrastructureNav()
    .then(present)
    .then(mockRandomUpdates)
    .then(subscribe)
    .catch((e) => {});
}

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

const setStatusClass = (el: HTMLElement, status: string | undefined) => {
  if (!status) return;
  el.classList.remove(...STATUS_CLASSES); // Clean old state
  el.classList.add(`status-${status}`);
};

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

function present(data: NavItem[]): N_Ary<NavItem> {
  const tree = Tree.from(data);
  const container = document.querySelector("main #nav");
  const rootNode = tree?.root;
  if (rootNode) {
    container?.append(render(rootNode, tree.nodes));
  }
  return tree;
}

function render(
  node: N_ary_Node<NavItem>,
  nodeMap: Map<string, N_ary_Node<NavItem>>
): HTMLElement {
  const list = document.createElement("ul");
  list.className = "nav-list";
  const state = new Set<string>();

  const build = (node: N_ary_Node<NavItem>) => {
    const { children, value, id } = node;
    const { name, status } = value;

    const li = document.createElement("li");
    li.className = "nav-item";
    if (status) setStatusClass(li, status);
    li.innerHTML = `<span>${name}</span>`;
    li.setAttribute("id", id);
    if (children.length) {
      li.classList.add("nav-parent");
      if (state.has(id)) {
        li.classList.remove("nav-parent");
        li.classList.add("nav-parent-open");
        const ul = document.createElement("ul");
        ul.className = "nav-list";
        children.forEach((child) => {
          ul.append(build(child));
        });
        li.append(ul);
      }
    }
    return li;
  };

  const toggle = (id: string) => {
    if (state.has(id)) {
      state.delete(id);
    } else {
      state.add(id);
    }
  };

  list.onclick = function (e) {
    e.stopPropagation();
    const target = e.target;
    if (target instanceof HTMLElement) {
      const item = target.closest(".nav-item");
      const id = item?.getAttribute("id");
      if (id && item) {
        toggle(id);
        const node = nodeMap?.get(id);
        if (node) {
          const parent = item?.parentElement || item?.closest(".nav-list");
          const newNode = build(node);
          parent?.replaceChild(newNode, item);
        }
      }
    }
  };
  list.addEventListener(EVENTID, (e) => {
    const event = e as CustomEvent;
    const { detail } = event;
    const { status } = detail;
    const target = event.target;
    if (target instanceof HTMLElement) {
      if (status) setStatusClass(target, status);
    }
  });

  list.append(build(node));
  return list;
}
