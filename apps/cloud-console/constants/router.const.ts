export const CLOUD_CONSOLE_ROUTE_KEYS = {
  RES_ID: "RESOURCE_IDENTIFIER",
  ALERT_DETAIL: "ALERT_DETAILER",
} as const;

// Helper Type: Extracts "RESOURCE_IDENTIFIER" | "ALERT_DETAILER"
export type RouteIdentifier =
  (typeof CLOUD_CONSOLE_ROUTE_KEYS)[keyof typeof CLOUD_CONSOLE_ROUTE_KEYS];

const PATH_GREPPERS: Record<string, RegExp> = {
  [CLOUD_CONSOLE_ROUTE_KEYS.RES_ID]: /\/resource\/([a-zA-Z0-9_-]+)/i,
  [CLOUD_CONSOLE_ROUTE_KEYS.ALERT_DETAIL]: /\/alert\/([a-zA-Z0-9_-]+)/i,
};

type Constant = Record<
  string,
  Record<string, RegExp> | string | Record<string, string>
>;

const CLOUD_CONSOLE_ROUTE_CONSTANTS = {
  Identifiers: PATH_GREPPERS,
  APP_BASE: "cloud-console",
} satisfies Constant;

export default CLOUD_CONSOLE_ROUTE_CONSTANTS;
