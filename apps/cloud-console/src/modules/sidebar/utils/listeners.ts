import type { N_ary_Node } from "@platform/types/interfaces/n-ary.interface";
import type { NavItem } from "@cloud-types/sidebar";
import { toggleNavState as toggle } from "@cloud-modules/sidebar/utils/nav-utils";
import {
  getTargets,
  rebuild,
  setStatusClass,
  setSelected,
} from "@cloud-modules/sidebar/view";
import AppRouter from "@cloud-router/index";
import { ROUTE_KEYS } from "@cloud-types/router.types";

export function onclick(
  e: Event,
  nodeMap: Map<string, N_ary_Node<NavItem>>,
  state: Set<string> | undefined,
) {
  e.stopPropagation();
  const [target, parentNode] = getTargets(e);
  const id = target?.getAttribute("id");
  if (target && id && state) {
    toggle(id, state);
    const node = nodeMap?.get(id);
    if (node && parentNode) {
      rebuild(node, state, target, parentNode);
      setSelected(id);
      AppRouter.navigate(ROUTE_KEYS.RESOURCE, id);
    }
  }
}

export function onStatusChange(e: unknown) {
  const event = e as CustomEvent;
  const { detail } = event;
  const { status } = detail;
  const target = event.target;
  if (target instanceof HTMLElement) {
    if (status) setStatusClass(target, status);
  }
}
