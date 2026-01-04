import { fetchInfrastructureNav } from "@cloud/mocks/nav";
import { default as Tree } from "@cloud/structures/n-ary";
import N_Ary, { N_ary_Node } from "@cloud/types/interfaces/n-ary.interface";
import { NavItem } from "@cloud/types/sidebar";

export function onload() {
  fetchInfrastructureNav()
    .then((data) => Tree.from(data))
    .then((tree) => present(tree))
    .catch((e) => {});
}

function present(tree: N_Ary<NavItem>): void {
  const container = document.querySelector("main #nav");
  const rootNode = tree?.root;
  if (rootNode) {
    container?.append(render(rootNode, tree.nodes));
  }
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
    const { name } = value;
    const li = document.createElement("li");
    li.className = "nav-item";
    li.textContent = name;
    li.setAttribute("id", id);
    if (children.length && state.has(id)) {
      const ul = document.createElement("ul");
      ul.className = "nav-list";
      children.forEach((child) => {
        ul.append(build(child));
      });
      li.append(ul);
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
  list.append(build(node));
  return list;
}
