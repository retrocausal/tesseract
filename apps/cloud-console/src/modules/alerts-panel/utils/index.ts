import CONFIG from "@cloud-modules/alerts-panel/config";
import type GenericHeap from "@tesseract/platform/types/interfaces/heap.interface";
import type { Alert } from "@cloud-types/alerts.ui.types";

const { LIMIT, BUFFER } = CONFIG;

export function currentTime(): string {
  // 1. Get the best available locales as an array
  const locale = window?.navigator?.languages || [
      window?.navigator?.language,
    ] || [new Intl.DateTimeFormat().resolvedOptions().locale] || ["en-US"];

  return new Date().toLocaleTimeString(locale, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}
export function buildFrame(struct: GenericHeap<Alert>, state: Alert[]): void {
  let count = BUFFER;

  while (count > 0) {
    const next = struct.pop();
    if (!next) break; // Heap is empty, stop pulling

    // If we hit the 10-second conveyor belt limit, make room
    if (state.length >= LIMIT) {
      state.shift();
    }

    state.push(next);
    count--;
  }
}
