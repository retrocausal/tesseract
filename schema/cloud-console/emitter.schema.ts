import { Type, type Static } from "@sinclair/typebox";
import { AlertSchema } from "@schema/cloud-console/alerts.schema";

// Alert Dispatch
export const AlertDispatchSchema = Type.Intersect([
  Type.Object({
    kind: Type.Literal("alert:dispatch"),
  }),
  AlertSchema,
]);

// Log Dispatch
const LogSchema = Type.Object({
  id: Type.String(),
  message: Type.String(),
});

export const LogDispatchSchema = Type.Object({
  kind: Type.Literal("log:dispatch"),
  resourceId: Type.String(),
  logs: Type.Array(LogSchema),
});

// Status Dispatch
export const StatusDispatchSchema = Type.Object({
  kind: Type.Literal("status:update"),
  id: Type.String(),
  status: Type.String(),
});

// This is internal, so we define the shape we want.
export const FocusedAlertDispatchSchema = Type.Intersect([
  AlertSchema,
  Type.Object({
    time: Type.String(),
  }),
]);

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
