import { default as EventPubSubProvider } from "@cloud-utils/emitter";
import { default as Heap } from "@platform/structures/heap.struct";
import type { Alert, AlertPanelState } from "@cloud-types/alerts.types";
import render from "@cloud-modules/alerts-panel/view";
import { ComparatorFn } from "@platform/types/interfaces/heap";
import { AlertScaffolding } from "@cloud-types/alerts.types";
import {
  onClick,
  onMouseEnter,
  onMouseLeave,
} from "@cloud-modules/alerts-panel/utils/listeners";
import CONFIG from "@cloud-modules/alerts-panel/config";
import { buildFrame, currentTime } from "@cloud/modules/alerts-panel/utils";

const { TIMEINTERVAL } = CONFIG;

function subscribe(heap: Heap<Alert>) {
  return EventPubSubProvider.subscribe("alert:dispatch", (payload) => {
    const { id, priority, message, resourceId, severity } = payload;
    heap.add({
      priority,
      message,
      id,
      resourceId,
      severity,
      time: currentTime(),
    });
  });
}

function attachListeners(state: AlertPanelState, root: HTMLUListElement) {
  root.onmouseenter = onMouseEnter;
  root.onmouseleave = onMouseLeave;
  root.onclick = (e) => onClick(e, root, state);
}

function initPanel(scaffold: AlertScaffolding) {
  attachListeners(scaffold.state, scaffold.root);
  subscribe(scaffold.heap);
}

async function run(scaffold: AlertScaffolding) {
  const { state, root, heap } = scaffold;
  const paint = () => {
    const now = performance.now();
    const diff = now - (state.lastRender ?? 0);
    const watched = root.dataset.watched || false;
    const canRender = diff > TIMEINTERVAL && !watched && !state.focussedAlert;
    const haveAlerts = heap.size;
    if (haveAlerts && canRender) {
      buildFrame(heap, state.stream);
      root.replaceChildren();
      render(state.stream, root);
      state.lastRender = performance.now();
    }
    requestAnimationFrame(paint);
  };
  requestAnimationFrame(paint);
}

async function bootstrap(root: HTMLUListElement): Promise<AlertScaffolding> {
  const AlertStream: Alert[] = new Array();
  const Comparator: ComparatorFn<Alert> = (a, b) =>
    (b?.priority || 0) - (a?.priority || 0);
  const MaxHeap = new Heap<Alert>(Comparator);
  const state: AlertPanelState = {
    stream: AlertStream,
    lastRender: null,
    focussedAlert: null,
  };
  const scaffold = { state, heap: MaxHeap, root };
  initPanel(scaffold);
  return scaffold;
}

export function onload(root: HTMLUListElement | null) {
  if (root) {
    return bootstrap(root).then(run);
  }
  return Promise.reject();
}
