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
  };
};

export type Resolver = (value: string) => void;

export type StaticResolverMap = Map<string, Resolver[]>;

export interface AppRouterStatic {
  new (): PlatformRouterTemplate;
}
