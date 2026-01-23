export type Dispatch = "status:update" | "alert:dispatch" | "log:dispatch";
export type AlertDispatch = {
  id: string;
  resourceId: string;
  alert: string;
  kind: Dispatch;
  priority: number;
  severity: string;
};

export type Log = {
  id: string;
  message: string;
};
export type LogDispatch = {
  resourceId: string;
  logs: Log[];
  kind: Dispatch;
};

export type StatusDispatch = { id: string; status: string; kind: Dispatch };
export type EmitterEventMap = {
  "status:update": StatusDispatch;
  "alert:dispatch": AlertDispatch;
  "log:dispatch": LogDispatch;
};
