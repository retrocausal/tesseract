import { CloudConsole } from "@schema";
import "@cloud-modules/alerts-panel/styles/index.css";
export default function render(
  alerts: CloudConsole.Alert[],
  root: HTMLUListElement,
  focusedAlert?: string | null,
): void {
  const fragment = document.createDocumentFragment();
  if (alerts.length) {
    for (const alert of alerts) {
      const { message, id, severity, time, resourceId } = alert;
      const li = document.createElement("li");
      li.setAttribute("id", id);
      li.dataset.resource = resourceId;
      const alertHead = document.createElement("h4");
      alertHead.textContent = message;
      li.className = "item";
      li.append(alertHead);
      const timestamp = document.createElement("span");
      timestamp.textContent = time;
      li.append(timestamp);
      if (severity) {
        li.classList?.add(`alert-${severity.toLowerCase()}`);
      }
      if (
        focusedAlert &&
        id === focusedAlert &&
        !li.classList.contains("selected")
      ) {
        li.classList.add("selected");
      }
      fragment.append(li);
    }
  }
  root?.append(fragment);
}
