import { ConsoleSchema } from "@tesseract/schema";

const {
  AlertDispatchSchema,
  LogDispatchSchema,
  StatusDispatchSchema,
  FocusedAlertDispatchSchema,
  GenericDispatchSchema,
} = ConsoleSchema;
import { type Static } from "@sinclair/typebox";

// --------------------------------------------------------------------------
//  INFERRED TYPES
// --------------------------------------------------------------------------

export type AlertDispatch = Static<typeof AlertDispatchSchema>;
export type LogDispatch = Static<typeof LogDispatchSchema>;
export type StatusDispatch = Static<typeof StatusDispatchSchema>;
export type FocusedAlertDispatch = Static<typeof FocusedAlertDispatchSchema>;
export type Dispatch = Static<typeof GenericDispatchSchema>;

// --------------------------------------------------------------------------
// RUNTIME INTERFACES (The Event Map)
// --------------------------------------------------------------------------

export type EmitterEventMap = {
  "status:update": Omit<StatusDispatch, "kind">;
  "alert:dispatch": Omit<AlertDispatch, "kind">;
  "log:dispatch": Omit<LogDispatch, "kind">;
  "focused:alert": FocusedAlertDispatch;
};
