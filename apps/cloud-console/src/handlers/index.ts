import { onload as RenderNav } from "@cloud-modules/sidebar/index";
import { onload as BootstrapAlerts } from "@cloud-modules/alerts-panel/index";
import { fetchInfrastructureNav } from "@cloud-mocks/nav";
import type {
  NavItem,
  Scaffolder as SidebarBootstrapper,
} from "@cloud-types/sidebar";

function bootstrapApp() {
  //sidebar
  const sidebar = fetchInfrastructureNav()
    .then((data: NavItem[]) => {
      const root = document.querySelector("main #nav");
      return { data, container: root } as SidebarBootstrapper;
    })
    .then(RenderNav);
  //alerts
  const alerts = Promise.resolve(BootstrapAlerts());
  return Promise.all([sidebar, alerts]);
}

export function onload(_e: Event) {
  bootstrapApp().then(() => {
    import("@cloud-router/index")
      .then((module) => module.default)
      .then((AppRouter) => {
        AppRouter?.sync();
      });
  });
}
