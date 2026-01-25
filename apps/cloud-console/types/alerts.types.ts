import type { FocusedAlertDispatch } from "@cloud-types/emitter.types";
import BinaryHeap from "@platform/structures/heap.struct";

export type Alert = FocusedAlertDispatch & {};

export type AlertPanelState = {
  stream: Alert[];
  focussedAlert: string | null;
  lastRender: number | null;
};

export type AlertScaffolding = {
  state: AlertPanelState;
  heap: BinaryHeap<Alert>;
  root: HTMLUListElement;
};
