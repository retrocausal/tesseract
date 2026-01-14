import type N_Ary from "@common-types/interfaces/n-ary.interface";
import type { NavItem } from "@cloud/types/sidebar";
import { default as EventPubSubProvider } from "@cloud/utils/emitter";
import type { Dispatch } from "@cloud/types/emitter.types";

// 1. Define what the Socket sends us (The Contract)
type SocketMessage = {
  kind: Dispatch;
  id: string;
  status?: string;
  alerts?: string[];
  logs?: string[];
  priority?: number;
  severity?: string;
};

export default function websocketProvider(
  tree: N_Ary<NavItem> | undefined
): N_Ary<NavItem> | undefined {
  const socket = new WebSocket("ws://localhost:17000");
  if (tree) {
    socket.onopen = function () {
      setTimeout(() => {
        const { nodes } = tree;
        const nodeList = Array.from(nodes).filter(
          (node) => node[1]?.value?.kind === "pod"
        );
        const ids = nodeList.map((node) => node[0]);
        socket.send(JSON.stringify({ ids }));
      }, 10000);
    };

    socket.onmessage = (event) => {
      // 2. Unsafe Cast: We assert we know the shape of the incoming JSON
      const data = JSON.parse(event?.data) as SocketMessage;
      const { kind, status, alerts, logs, id, priority, severity } = data;
      // 3. Handle the correlation strictly
      // We cannot just pass 'data' blindly because the payloads differ.
      switch (kind) {
        case "status:update":
          if (status) EventPubSubProvider.emit(kind, { kind, id, status });
          break;
        case "alert:dispatch":
          if (alerts && alerts.length)
            EventPubSubProvider.emit(kind, {
              kind,
              id,
              alerts,
              priority: priority || 0,
              severity: severity || "",
            });
          break;
        case "log:dispatch":
          if (logs && logs.length)
            EventPubSubProvider.emit(kind, { kind, id, logs });
          break;
      }
    };
  }

  return tree;
}
