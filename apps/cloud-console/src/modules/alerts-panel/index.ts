import { default as EventPubSubProvider } from "@cloud/utils/emitter";
import { default as Heap } from "@common-struct/heap.struct";
import type { Alert } from "@cloud/types/alerts.types";
import type GenericHeap from "@common-types/interfaces/heap";
import render from "@cloud/modules/alerts-panel/view";

const LIMIT = 50;
const BUFFER = 20;
const TIMEINTERVAL = 1800;

function currentTime(): string {
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

function buildFrame(struct: GenericHeap<Alert>, currentState: Alert[]): void {
  const state = currentState;
  if (state.length < LIMIT) {
    let diff = LIMIT - state.length;
    while (diff > 0) {
      diff--;
      const next = struct.pop();
      if (next) state.unshift(next);
      else break;
    }
  } else {
    let index = BUFFER;
    while (index) {
      index--;
      const next = struct.pop();
      if (next) {
        state.pop();
        state.unshift(next);
      } else break;
    }
  }
}

export function onload() {
  let UIStream: Alert[] = new Array();
  const MaxHeap = new Heap<Alert>(
    (a, b) => (b?.priority || 0) - (a?.priority || 0)
  );
  EventPubSubProvider.subscribe("alert:dispatch", (payload) => {
    const { id, priority, alerts, severity } = payload;
    alerts?.forEach((alert) => {
      MaxHeap.add({
        priority,
        message: alert,
        id: `${id}-${priority}-${crypto.randomUUID()}`,
        severity,
        time: currentTime(),
      });
    });
  });
  let lastFramePainted = 0;
  let streamBeingWatched = false;
  let focusedAlert: string | null = null;
  const container = document.querySelector(
    "main #alerts .alert-stream"
  ) as HTMLElement;
  container.onmouseenter = function (e) {
    streamBeingWatched = true;
  };
  container.onmouseleave = function (e) {
    streamBeingWatched = false;
  };
  container.onclick = function (e) {
    const target = e?.target;
    if (target instanceof HTMLElement) {
      const alertNode = target.closest(".item");
      const activelyFocused = alertNode?.getAttribute("id") ?? null;
      if (activelyFocused && focusedAlert === activelyFocused)
        focusedAlert = null;
      else {
        if (activelyFocused) {
          focusedAlert = activelyFocused;
          lastFramePainted = performance.now();
        }
      }
      alertList.replaceChildren();
      render(UIStream, alertList, focusedAlert);
    }
  };
  const alertList = document.createElement("ul");
  alertList.className = "list";
  const refresh = () => {
    const now = performance.now();
    const interval = now - lastFramePainted;
    const canRefresh =
      !streamBeingWatched &&
      interval > TIMEINTERVAL &&
      MaxHeap.size &&
      !focusedAlert;
    if (canRefresh) {
      buildFrame(MaxHeap, UIStream);
      alertList.replaceChildren();
      render(UIStream, alertList);
      lastFramePainted = performance.now();
    }
    requestAnimationFrame(refresh);
  };
  container?.append(alertList);
  requestAnimationFrame(refresh);
}
