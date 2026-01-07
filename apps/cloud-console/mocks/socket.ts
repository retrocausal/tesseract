import type N_Ary from "@common-types/interfaces/n-ary.interface";
import type { NavItem } from "@cloud/types/sidebar";
import { default as EventPubSubProvider } from "@cloud/modules/emitter";

export default function websocketProvider(
  tree: N_Ary<NavItem>
): N_Ary<NavItem> {
  const socket = new WebSocket("ws://localhost:17000");
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
    console.log(event.data);

    const { id, status, kind } = JSON.parse(event?.data);
    EventPubSubProvider.emit("status:update", { id, status, kind });
  };
  return tree;
}
