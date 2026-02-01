import { ConsoleSchema } from "@tesseract/schema";

const {
  AlertDispatchSchema,
  LogDispatchSchema,
  StatusDispatchSchema,
  FocusedAlertDispatchSchema,
} = ConsoleSchema;
import { type Static } from "@sinclair/typebox";

// --------------------------------------------------------------------------
//  INFERRED TYPES
// --------------------------------------------------------------------------

export type AlertDispatch = Static<typeof AlertDispatchSchema>;
export type LogDispatch = Static<typeof LogDispatchSchema>;
export type StatusDispatch = Static<typeof StatusDispatchSchema>;
export type FocusedAlertDispatch = Static<typeof FocusedAlertDispatchSchema>;

// --------------------------------------------------------------------------
// RUNTIME INTERFACES (The Event Map)
// --------------------------------------------------------------------------

export type EmitterEventMap = {
  "status:update": StatusDispatch;
  "alert:dispatch": AlertDispatch;
  "log:dispatch": LogDispatch;
  "focused:alert": FocusedAlertDispatch;
};

export type Dispatch = AlertDispatch | LogDispatch | StatusDispatch;
