import { type Dispatch } from "@cloud-types/emitter.ui.types";

import { default as EventPubSubProvider } from "@cloud-utils/emitter";

export default function registerClient() {
  // 1. Determine Protocol (Secure or Insecure)
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  // 2. Get the Current Host (e.g., "tesseract.schrodingers.cat" or "localhost:5173")
  const host = window.location.host;

  // 3. Construct the Absolute URL
  // Result: wss://tesseract.schrodingers.cat/socket/mock/cloud-console
  const socket = new WebSocket(
    `${protocol}//${host}/socket/mock/cloud-console`,
  );

  socket.onopen = function () {};

  socket.onmessage = (event) => {
    try {
      // 1. Safe Cast: We assert this matches one of our 3 strict shapes
      const data = JSON.parse(event.data) as Dispatch;

      // 2. Discriminated Union Switch
      // TS knows exactly which properties exist in each case block.
      switch (data.kind) {
        case "status:update":
          // TS knows 'data' is StatusDispatch here.
          // We pass it directly; the Emitter strictly accepts StatusDispatch.
          EventPubSubProvider.emit(data.kind, data);
          break;

        case "alert:dispatch":
          // TS knows 'data' is AlertDispatch here.
          EventPubSubProvider.emit(data.kind, data);
          break;

        case "log:dispatch":
          // TS knows 'data' is LogDispatch here.
          EventPubSubProvider.emit(data.kind, data);
          break;

        default:
          console.warn("Unknown Event Kind received:", (data as any).kind);
      }
    } catch (e) {
      console.error("Socket Parse Error", e);
    }
  };
}
