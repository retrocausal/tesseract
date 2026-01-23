import type { AlertDispatch } from "@cloud-types/emitter.types";
import BinaryHeap from "@platform/structures/heap.struct";

export interface Alert extends Omit<AlertDispatch, "kind"> {
  time: string;
}

export type AlertPanelState = {
  stream: Alert[];
  focussedAlert: string | null;
  lastRender: number | null;
};

export type Scaffolding = {
  state: AlertPanelState;
  heap: BinaryHeap<Alert>;
  root: HTMLUListElement;
};
