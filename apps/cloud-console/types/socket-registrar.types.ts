import { Type, Static } from "@sinclair/typebox";
import { SerializableSchema } from "@tesseract/platform/types/interfaces/serializable.interface";
import { ConsoleSchema } from "@tesseract/schema";

const registrarTriggersSchema = Type.Union([
  Type.Literal("REGISTER"),
  Type.Literal("KILL"),
]);

export type Trigger = Static<typeof registrarTriggersSchema>;
export type SocketMessage = Static<typeof SerializableSchema>;
export type ValidData = Static<typeof ConsoleSchema.GenericDispatchSchema>;
export type SocketReceptionCB = (event: MessageEvent<string>) => void;
