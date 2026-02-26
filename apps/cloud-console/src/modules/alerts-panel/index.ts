import { default as EventPubSubProvider } from "@cloud-utils/emitter";
import { default as Heap } from "@tesseract/platform/structures/heap.struct";
import render, { initView } from "@cloud-modules/alerts-panel/view";
import type { ComparatorFn } from "@tesseract/platform/types/interfaces/heap.interface";
import {
  onClick,
  onMouseEnter,
  onMouseLeave,
} from "@cloud-modules/alerts-panel/utils/listeners";
import CONFIG from "@cloud-modules/alerts-panel/config";
import { buildFrame, currentTime } from "@cloud/modules/alerts-panel/utils";
import {
  type Alert,
  type AlertPanelState,
  type AlertScaffolding,
} from "@cloud-types/alerts.ui.types";
import { AlertDispatch } from "@cloud-types/emitter.ui.types";

const { TIMEINTERVAL, RELEGATIONS, LIMIT } = CONFIG;
type RegulatedAlertDispatch = Omit<AlertDispatch, "kind">;

function subscribe(heap: Heap<Alert>) {
  const regulate = (payload: RegulatedAlertDispatch) => {
    const size = heap.size;
    const { severity } = payload;
    if (size < RELEGATIONS[severity])
      heap.add({ ...payload, time: currentTime() });
  };
  return EventPubSubProvider.subscribe("alert:dispatch", regulate);
}

function initPanel(scaffold: AlertScaffolding) {
  scaffold.root.onmouseenter = onMouseEnter;
  scaffold.root.onmouseleave = onMouseLeave;
  scaffold.root.onclick = (e) => onClick(e, scaffold.state, scaffold.items);
  subscribe(scaffold.heap);
}

async function run(scaffold: AlertScaffolding) {
  const { state, root, heap, items } = scaffold;
  const paint = () => {
    const now = performance.now();
    const diff = now - (state.lastRender ?? 0);
    const watched = root.dataset.watched || false;
    const canRender = diff > TIMEINTERVAL && !watched && !state.focussedAlert;
    const haveAlerts = heap.size;
    if (haveAlerts && canRender) {
      buildFrame(heap, state.stream);
      render(state, items);
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
  const items = initView(LIMIT, root);
  const scaffold = { state, heap: MaxHeap, root, items };
  initPanel(scaffold);
  return scaffold;
}

export function onload(root: HTMLUListElement | null) {
  if (root) {
    return bootstrap(root).then(run);
  }
  return Promise.reject();
}
