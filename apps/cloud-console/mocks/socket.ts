import type N_Ary from "@tesseract/platform/types/interfaces/n-ary.interface";
import { CloudConsole } from "@tesseract/schema";

import { default as EventPubSubProvider } from "@cloud-utils/emitter";

export default function websocketProvider(
  tree: N_Ary<CloudConsole.NavItem> | undefined,
): N_Ary<CloudConsole.NavItem> | undefined {
  const socket = new WebSocket("ws://localhost:17000");

  if (tree) {
    socket.onopen = function () {
      // We simulate a delay to let the UI render first
      setTimeout(() => {
        // Strict Id extraction for Pods only
        const { nodes } = tree;
        const nodeList = Array.from(nodes).filter(
          (node) => node[1]?.value?.kind === "pod",
        );
        const ids = nodeList.map((node) => node[0]);

        socket.send(JSON.stringify({ type: "REGISTER_IDS", ids }));
      }, 10000);
    };

    socket.onmessage = (event) => {
      try {
        // 1. Safe Cast: We assert this matches one of our 3 strict shapes
        const data = JSON.parse(event.data) as CloudConsole.Dispatch;

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

  return tree;
}
