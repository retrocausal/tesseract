import type N_Ary from "@platform/types/interfaces/n-ary.interface";
import type { NavItem } from "@cloud-types/sidebar";
import { default as EventPubSubProvider } from "@cloud-utils/emitter";
import type {
  AlertDispatch,
  LogDispatch,
  StatusDispatch,
} from "@cloud-types/emitter.types";

// 1. Define what the Socket sends us (The Contract)
interface SocketMessage
  extends
    Partial<AlertDispatch>,
    Partial<LogDispatch>,
    Partial<StatusDispatch> {}

export default function websocketProvider(
  tree: N_Ary<NavItem> | undefined,
): N_Ary<NavItem> | undefined {
  const socket = new WebSocket("ws://localhost:17000");
  if (tree) {
    socket.onopen = function () {
      setTimeout(() => {
        const { nodes } = tree;
        const nodeList = Array.from(nodes).filter(
          (node) => node[1]?.value?.kind === "pod",
        );
        const ids = nodeList.map((node) => node[0]);
        socket.send(JSON.stringify({ ids }));
      }, 10000);
    };

    socket.onmessage = (event) => {
      // 2. Unsafe Cast: We assert we know the shape of the incoming JSON
      const data = JSON.parse(event?.data) as SocketMessage;
      console.log(data);

      const { kind, status, alert, logs, id, priority, severity, resourceId } =
        data;
      // 3. Handle the correlation strictly
      // We cannot just pass 'data' blindly because the payloads differ.
      switch (kind) {
        case "status:update":
          if (status && id)
            EventPubSubProvider.emit(kind, { kind, id, status });
          break;
        case "alert:dispatch":
          if (alert && resourceId && id)
            EventPubSubProvider.emit(kind, {
              kind,
              id,
              alert,
              priority: priority || 0,
              severity: severity || "",
              resourceId,
            });
          break;
        case "log:dispatch":
          if (logs && logs.length && resourceId)
            EventPubSubProvider.emit(kind, { kind, logs, resourceId });
          break;
      }
    };
  }

  return tree;
}
