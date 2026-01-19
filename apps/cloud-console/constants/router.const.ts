import { ROUTE_KEYS, type Routes } from "@cloud-types/router.types";

export const CLOUD_CONSOLE_ROUTES: Routes = {
  [ROUTE_KEYS.RESOURCE]: {
    captureExpression: /\/resource\/([a-zA-Z0-9_-]+)/i,
    route: (id: string) => `/resource/${id}`,
  },
  [ROUTE_KEYS.ALERT]: {
    captureExpression: /\/alert\/([a-zA-Z0-9_-]+)/i,
    route: (id: string) => `/alert/${id}`,
  },
  [ROUTE_KEYS.LOG]: {
    captureExpression: /\/log\/([a-zA-Z0-9_-]+)/i,
    route: (id: string) => `/log/${id}`,
  },
};

type Constant = Record<string, Routes | string>;

const CLOUD_CONSOLE_ROUTE_CONSTANTS = {
  routes: CLOUD_CONSOLE_ROUTES,
  APP_BASE: "cloud-console",
} satisfies Constant;

export default CLOUD_CONSOLE_ROUTE_CONSTANTS;
