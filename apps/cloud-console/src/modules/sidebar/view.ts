import { default as Tree } from "@common-struct/n-ary.struct";
import type {
  N_ary_Node,
  default as N_Ary,
} from "@common-types/interfaces/n-ary.interface";
import type { NavItem } from "@cloud/types/sidebar";

export const EVENTID = "OnStatusChange";

const STATUS_CLASSES = [
  "status-active",
  "status-degraded",
  "status-offline",
  "status-booting",
];

const setStatusClass = (el: HTMLElement, status: string | undefined) => {
  if (!status) return;
  el.classList.remove(...STATUS_CLASSES); // Clean old state
  el.classList.add(`status-${status}`);
};

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

export function present(data: NavItem[]): N_Ary<NavItem> {
  const tree = Tree.from(data);
  const container = document.querySelector("main #nav");
  const rootNode = tree?.root;
  if (rootNode) {
    container?.append(render(rootNode, tree.nodes));
  }
  return tree;
}
