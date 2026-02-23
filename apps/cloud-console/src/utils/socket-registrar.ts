import { Value } from "@sinclair/typebox/value";
import { ConsoleSchema } from "@tesseract/schema";
import type {
  Trigger,
  SocketMessage,
  SocketReceptionCB,
} from "@cloud-types/socket-registrar.types";

function receiver(e: MessageEvent<Trigger>) {
  const switcher = e?.data;
  switch (switcher) {
    case "REGISTER":
      SocketRegistrar.init(socketReceiver);
      break;
    case "KILL":
      break;
    default:
      break;
  }
}

function validate(data: SocketMessage) {
  if (!Value.Check(ConsoleSchema.GenericDispatchSchema, data)) {
    throw new Error(
      [...Value.Errors(ConsoleSchema.GenericDispatchSchema, data)].join(","),
    );
  }
  return data;
}

function socketReceiver(event: MessageEvent<string>) {
  try {
    const data = JSON.parse(event.data) as SocketMessage;
    self.postMessage(validate(data));
  } catch (e) {
    console.error("Socket Parse Error", e);
  }
}

class SocketRegistrar {
  static socket: WebSocket | null = null;
  static init(cb: SocketReceptionCB) {
    const protocol = self.location.protocol === "https:" ? "wss:" : "ws:";
    const host = self.location.host;
    //  Construct the Absolute URL
    const socket = new WebSocket(
      `${protocol}//${host}/socket/mock/cloud-console`,
    );
    socket.onmessage = cb;
    this.socket = socket;
  }
}

self.addEventListener("message", receiver);
