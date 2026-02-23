import { onload as RenderNav } from "@cloud-modules/sidebar/index";
import { onload as BootstrapAlerts } from "@cloud-modules/alerts-panel/index";
import { onload as initDetails } from "@cloud-modules/details-panel/index";
import type { Scaffolder as SidebarBootstrapper } from "@cloud-types/nav.ui.types";
import { NavHooks } from "@cloud-clients";
import { Dispatch } from "@cloud-types/emitter.ui.types";
import { default as EventPubSubProvider } from "@cloud-utils/emitter";
function broadcast(event: MessageEvent<Dispatch>) {
  const { data } = event;
  switch (data.kind) {
    case "status:update": {
      // Braces create a new local scope
      const { kind, ...payload } = data; // payload is narrowed to Omit<StatusDispatch, 'kind'>
      EventPubSubProvider.emit(kind, payload);
      break;
    }
    case "alert:dispatch": {
      // Separate isolated scope
      const { kind, ...payload } = data; // payload is narrowed to Omit<AlertDispatch, 'kind'>
      EventPubSubProvider.emit(kind, payload);
      break;
    }
    case "log:dispatch": {
      const { kind, ...payload } = data;
      EventPubSubProvider.emit(kind, payload);
      break;
    }
    default: {
      console.warn("Unknown Event Kind received:", (data as any).kind);
    }
  }
}

function pluginUpdateListener() {
  const registrar = new Worker(
    new URL("../utils/socket-registrar.ts", import.meta.url),
    { type: "module" },
  );
  registrar.postMessage("REGISTER");
  registrar.onmessage = broadcast;
}

function bootstrapApp() {
  //sidebar
  const nav = NavHooks.fetchInfra()
    .then((data): SidebarBootstrapper => {
      const root = document.querySelector("main #nav");
      return { data, container: root };
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
        .then((AppRouter) => AppRouter.sync())
        .then(pluginUpdateListener);
    })
    .catch((e) => {
      console.error(e);
    });
}
