export type EmitterEventMap = {
  "status:update": {
    id: string;
    status: string;
    kind: string;
  };
  "alert:dispatch": {
    id: string;
    alerts: string[];
    kind: string;
  };
  "log:dispatch": {
    id: string;
    logs: string[];
    kind: string;
  };
};
