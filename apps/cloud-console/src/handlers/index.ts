import { onload as RenderNav } from "@cloud/modules/sidebar/index";
import { onload as BootstrapAlerts } from "@cloud/modules/alerts-panel/index";

export function onload(_e: Event) {
  //sidebar
  RenderNav();
  //alerts
  BootstrapAlerts();
}
