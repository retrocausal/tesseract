import { onload as RenderNav } from "@cloud-modules/sidebar/index";
import { onload as BootstrapAlerts } from "@cloud-modules/alerts-panel/index";
import { onload as initDetails } from "@cloud-modules/details-panel/index";
import type {
  NavItem,
  Scaffolder as SidebarBootstrapper,
} from "@cloud-types/nav.ui.types";
import registerClient from "@cloud/peripherals/socket";

async function fetchInfra() {
  const sidebarReq = new Request("/api/mock/cloud/infrastructure", {
    method: "POST",
  });
  const infraResponse = await fetch(sidebarReq);
  return await infraResponse.json();
}

function bootstrapApp() {
  //sidebar
  const nav = fetchInfra()
    .then((data: NavItem[]) => {
      const root = document.querySelector("main #nav");
      return { data, container: root } as SidebarBootstrapper;
    })
    .then(RenderNav)
    .catch((e) => {
      //spaceholder. need to redirect to an error boundary
    });
  //alerts
  const alerts = BootstrapAlerts(
    document.querySelector("main #alerts .alert-stream .list"),
  );
  const details = Promise.resolve(initDetails());
  return Promise.all([details, nav, alerts]);
}

export function onload(_e: Event) {
  bootstrapApp()
    .then(() => {
      import("@cloud-router/index")
        .then((module) => module.default)
        .then((AppRouter) => AppRouter?.sync())
        .then(registerClient);
    })
    .catch((e) => {
      console.error(e);
    });
}
