import { onload as RenderNav } from "@cloud-modules/sidebar/index";
import { onload as BootstrapAlerts } from "@cloud-modules/alerts-panel/index";
import { onload as initDetails } from "@cloud-modules/details-panel/index";
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
  const alerts = BootstrapAlerts(
    document.querySelector("main #alerts .alert-stream .list"),
  );

  const details = Promise.resolve(initDetails());

  return Promise.all([details, sidebar, alerts]);
}

export function onload(_e: Event) {
  bootstrapApp()
    .then(() => {
      import("@cloud-router/index")
        .then((module) => module.default)
        .then((AppRouter) => AppRouter?.sync());
    })
    .catch((e) => {
      console.error(e);
    });
}
