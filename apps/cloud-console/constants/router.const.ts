import {
  type Greppers,
  ROUTE_KEYS,
  type Routes,
} from "@cloud-types/router.types";

export const CLOUD_CONSOLE_GREPPERS: Greppers = {
  [ROUTE_KEYS.RESOURCE]: /\/resource\/([a-zA-Z0-9_-]+)/i,
  [ROUTE_KEYS.ALERT]: /\/alert\/([a-zA-Z0-9_-]+)/i,
  [ROUTE_KEYS.LOG]: /\/log\/([a-zA-Z0-9_-]+)/i,
};

export const CLOUD_CONSOLE_ROUTES: Routes = {
  [ROUTE_KEYS.RESOURCE]: {
    captureExpression: CLOUD_CONSOLE_GREPPERS[ROUTE_KEYS.RESOURCE],
    route: function (identifiers) {
      if (!identifiers[ROUTE_KEYS.RESOURCE]) {
        throw new Error(`expected ${ROUTE_KEYS.RESOURCE} id, got none`);
      }
      return `/resource/${identifiers[ROUTE_KEYS.RESOURCE]}`;
    },
  },
  [ROUTE_KEYS.LOG]: {
    captureExpression: CLOUD_CONSOLE_GREPPERS[ROUTE_KEYS.LOG],
    route: function (identifiers) {
      if (!identifiers[ROUTE_KEYS.RESOURCE]) {
        throw new Error(`expected ${ROUTE_KEYS.RESOURCE} id, got none`);
      }
      if (!identifiers[ROUTE_KEYS.LOG]) {
        throw new Error(`expected ${ROUTE_KEYS.LOG} id, got none`);
      }
      return `/resource/${identifiers[ROUTE_KEYS.RESOURCE]}/log/${identifiers[ROUTE_KEYS.LOG]}`;
    },
  },
  [ROUTE_KEYS.ALERT]: {
    captureExpression: CLOUD_CONSOLE_GREPPERS[ROUTE_KEYS.ALERT],
    route: function (identifiers) {
      if (!identifiers[ROUTE_KEYS.RESOURCE]) {
        throw new Error(`expected ${ROUTE_KEYS.RESOURCE} id, got none`);
      }
      if (!identifiers[ROUTE_KEYS.ALERT]) {
        throw new Error(`expected ${ROUTE_KEYS.ALERT} id, got none`);
      }
      return `/resource/${identifiers[ROUTE_KEYS.RESOURCE]}/alert/${identifiers[ROUTE_KEYS.ALERT]}`;
    },
  },
};

type Constant = Record<string, Routes | string>;

const CLOUD_CONSOLE_ROUTE_CONSTANTS = {
  routes: CLOUD_CONSOLE_ROUTES,
  APP_BASE: "cloud-console",
} satisfies Constant;

export default CLOUD_CONSOLE_ROUTE_CONSTANTS;
