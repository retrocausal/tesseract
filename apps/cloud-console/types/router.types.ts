import type PlatformRouterTemplate from "@platform/types/interfaces/platform-router.interface";
import type {
  RouteUpdateType,
  QP,
} from "@platform/types/interfaces/platform-router.interface";
import type { Serializable } from "@platform/types/interfaces/serializable.interface";

export type AppRouteEvents = {
  "cloud:route:update": {
    type: RouteUpdateType;
    state: Serializable;
    query: QP;
    path: string;
    relativePath: string | undefined;
    routeCaptures: GREPPEDINFO[];
  };
};

export enum ROUTE_KEYS {
  RESOURCE = "RESOURCE",
  ALERT = "ALERT",
  LOG = "LOG",
}

export type RouteIdentifier = (typeof ROUTE_KEYS)[keyof typeof ROUTE_KEYS];

export type RouteDefinition = {
  captureExpression: RegExp;
  route(id: string): string;
};

export type Routes = Record<RouteIdentifier, RouteDefinition>;

export type GREPPEDINFO = {
  key: RouteIdentifier;
  value: string;
};

export type Resolver = (value: string) => void;

export type StaticResolverMap = Map<RouteIdentifier, Resolver[]>;

export interface AppRouterStatic {
  new (): PlatformRouterTemplate;
}
