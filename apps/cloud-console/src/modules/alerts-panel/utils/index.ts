import CONFIG from "@cloud-modules/alerts-panel/config";
import type GenericHeap from "@platform/types/interfaces/heap.interface";
import { CloudConsole } from "@schema";

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

export function buildFrame(
  struct: GenericHeap<CloudConsole.Alert>,
  currentState: CloudConsole.Alert[],
): void {
  const state = currentState;
  if (state.length < LIMIT) {
    let diff = LIMIT - state.length;
    while (diff > 0) {
      diff--;
      const next = struct.pop();
      if (next) state.push(next);
      else break;
    }
  } else {
    let index = BUFFER;
    while (index) {
      index--;
      const next = struct.pop();
      if (next) {
        state.shift();
        state.push(next);
      } else break;
    }
  }
}
