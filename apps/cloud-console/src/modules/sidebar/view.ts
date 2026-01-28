import type { N_ary_Node } from "@platform/types/interfaces/n-ary.interface";
import { CloudConsole } from "@schema";

import "@cloud-modules/sidebar/styles/index.css";

const STATUS_CLASSES = [
  "status-active",
  "status-degraded",
  "status-offline",
  "status-booting",
];

export const setStatusClass = (el: HTMLElement, status: string | undefined) => {
  if (!status) return;
  el.classList.remove(...STATUS_CLASSES); // Clean old state
  el.classList.add(`status-${status}`);
};

export function render(
  node: N_ary_Node<CloudConsole.NavItem>,
  state: Set<string>,
  innerHTML: boolean = false,
): HTMLElement {
  const build = (node: N_ary_Node<CloudConsole.NavItem>) => {
    const { children, value, id } = node;
    const { name, status } = value;
    const li = document.createElement("li");
    li.className = "nav-item";
    if (status) setStatusClass(li, status);
    li.innerHTML = `<span><a>${name}</a></span>`;
    li.setAttribute("id", id);
    li.setAttribute("tabIndex", "0");
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
  const fragment = build(node);
  if (!innerHTML) {
    const list = document.createElement("ul");
    list.className = "nav-list";
    list.append(fragment);
    return list;
  }

  return fragment;
}

export function getTargets(e: unknown): (Element | null | undefined)[] {
  let node, parent;
  if (e instanceof Event) {
    const target = e.target;
    if (target instanceof HTMLElement) {
      node = target.closest(".nav-item");
      parent = node?.parentElement || node?.closest(".nav-list");
    }
  }
  return [node, parent];
}

export function rebuild(
  node: N_ary_Node<CloudConsole.NavItem>,
  state: Set<string>,
  target?: HTMLElement,
  parent?: HTMLElement,
): HTMLElement | undefined {
  let child: HTMLElement | undefined = target;
  let ancestor: HTMLElement | undefined = parent;
  let newNode;
  if (!target) {
    child = document.getElementById(node.id) ?? undefined;
  }
  if (!parent) {
    ancestor = child?.parentElement ?? child?.closest(".nav-list") ?? undefined;
  }
  if (ancestor && child) {
    newNode = render(node, state, true);
    ancestor.replaceChild(newNode, child);
  }
  return newNode;
}

export function setSelected(id: string | null | undefined) {
  if (id) {
    const previous = document?.querySelector(".nav-item.selected");
    previous?.classList.remove("selected");
    const node = document?.getElementById(id);
    node?.classList.add("selected");
    node?.focus();
  }
}
