export type Dispatch = "status:update" | "alert:dispatch" | "log:dispatch";
export type AlertDispatch = {
  id: string;
  alerts: string[];
  kind: Dispatch;
  priority: number;
  severity: string;
};
export type LogDispatch = { id: string; logs: string[]; kind: Dispatch };
export type StatusDispatch = { id: string; status: string; kind: Dispatch };
export type EmitterEventMap = {
  "status:update": StatusDispatch;
  "alert:dispatch": AlertDispatch;
  "log:dispatch": LogDispatch;
};
