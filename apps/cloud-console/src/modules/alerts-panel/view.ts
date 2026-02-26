import "@cloud-modules/alerts-panel/styles/index.css";
import type { AlertPanelState } from "@cloud-types/alerts.ui.types";
export default function render(
  state: AlertPanelState,
  items: HTMLLIElement[],
): void {
  const { stream, focussedAlert } = state;
  for (let i = 0; i < stream.length; i++) {
    const alert = stream[i];
    const { message, id, severity, time, resourceId } = alert;
    const li = items[i];
    if (li) {
      li.className = "item";
      li.setAttribute("id", id);
      li.dataset.resource = resourceId;
      const alertHead = li.querySelector("h4");
      if (alertHead) {
        alertHead.textContent = message;
      }
      const timestamp = li.querySelector("span");
      if (timestamp) {
        timestamp.textContent = time || "";
      }
      if (severity) {
        li.classList?.add(`alert-${severity.toLowerCase()}`);
      }
      if (
        focussedAlert &&
        id === focussedAlert &&
        !li.classList.contains("selected")
      ) {
        li.classList.add("selected");
      }
    }
  }
}

export function initView(limit: number, root: HTMLUListElement) {
  let i = limit;
  const items: HTMLLIElement[] = new Array();
  const fragment = document.createDocumentFragment();
  while (i) {
    const li = document.createElement("li");
    const alertHead = document.createElement("h4");
    const timestamp = document.createElement("span");
    li.append(alertHead);
    li.append(timestamp);
    li.className = "item hidden";
    items.push(li);
    fragment.append(li);
    i--;
  }
  root.append(fragment);
  return items;
}
