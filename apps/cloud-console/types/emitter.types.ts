export type Dispatch = "status:update" | "alert:dispatch" | "log:dispatch";
export type AlertDispatch = {
  id: string;
  resourceId: string;
  message: string;
  kind: Dispatch;
  priority: number;
  severity: string;
  code: string;
  suggestion: string;
  runbookUrl: string;
  origin: string;
  labels: {
    team: string;
    region: string;
    environment: string;
  };
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

export type FocusedAlertDispatch = Omit<AlertDispatch, "kind"> & {
  time: string;
};

export type StatusDispatch = { id: string; status: string; kind: Dispatch };
export type EmitterEventMap = {
  "status:update": StatusDispatch;
  "alert:dispatch": AlertDispatch;
  "log:dispatch": LogDispatch;
  "focused:alert": FocusedAlertDispatch;
};
