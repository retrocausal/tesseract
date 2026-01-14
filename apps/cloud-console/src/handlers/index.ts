import { onload as RenderNav } from "@cloud/modules/sidebar/index";
import { onload as BootstrapAlerts } from "@cloud/modules/alerts-panel/index";
import { fetchInfrastructureNav } from "@cloud/mocks/nav";
import type {
  NavItem,
  BootstrapConfig as SidebarBootstrapper,
} from "@cloud/types/sidebar";

export function onload(_e: Event) {
  //sidebar
  fetchInfrastructureNav()
    .then((data: NavItem[]) => {
      const root = document.querySelector("main #nav");
      return { data, container: root } as SidebarBootstrapper;
    })
    .then(RenderNav);
  //alerts
  BootstrapAlerts();
}
