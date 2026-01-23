import { type AlertPanelState } from "@cloud-types/alerts.types";
import render from "@cloud/modules/alerts-panel/view";

export function onMouseEnter(e: Event) {
  const target = e?.target as HTMLElement;
  if (target) target.dataset.watched = "true";
}

export function onMouseLeave(e: Event) {
  const target = e?.target as HTMLElement;
  if (target) delete target.dataset.watched;
}

export function onClick(
  e: Event,
  alertList: HTMLUListElement,
  state: AlertPanelState,
) {
  const target = e?.target;
  if (target instanceof HTMLElement) {
    const alertNode = target.closest(".item");
    const activelyFocused = alertNode?.getAttribute("id") ?? null;
    if (state.focussedAlert === activelyFocused) state.focussedAlert = null;
    else {
      if (activelyFocused) {
        state.focussedAlert = activelyFocused;
        state.lastRender = performance.now();
      }
    }
    alertList.replaceChildren();
    render(state.stream, alertList, state.focussedAlert);
  }
}
