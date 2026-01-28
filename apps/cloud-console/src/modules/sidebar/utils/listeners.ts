import { toggleNavState as toggle } from "@cloud-modules/sidebar/utils/nav-utils";
import {
  getTargets,
  rebuild,
  setStatusClass,
  setSelected,
} from "@cloud-modules/sidebar/view";
import AppRouter from "@cloud-router/index";
import N_Ary from "@platform/types/interfaces/n-ary.interface";
import { CloudConsole } from "@schema";

export function onclick(e: Event) {
  e.stopPropagation();
  const [target] = getTargets(e);
  const id = target?.getAttribute("id");
  if (id)
    AppRouter.navigate(CloudConsole.ROUTE_KEYS.RESOURCE, {
      [CloudConsole.ROUTE_KEYS.RESOURCE]: id,
    });
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

export function hydrateStateFromURL(
  resourceID: string,
  tree: N_Ary<CloudConsole.NavItem>,
  state: Set<string>,
) {
  if (resourceID) {
    if (state?.size > 0) {
      toggle(resourceID, state);
      const node = tree?.nodes?.get(resourceID);
      node && rebuild(node, state);
    } else {
      const lineage = tree?.lineage(resourceID);
      if (lineage) {
        for (let i = lineage.length - 1; i > -1; i--) {
          const resource = lineage[i];
          state?.add(resource.id);
        }
        if (tree.root) {
          rebuild(tree.root, state);
        }
      }
    }
    setSelected(resourceID);
  }
}
