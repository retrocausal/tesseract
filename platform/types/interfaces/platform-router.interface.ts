import type { Serializable } from "@platform-types/interfaces/serializable.interface";
export default interface PlatformRouterTemplate {
  readonly queryParams: QP | null;
  readonly pathFragments: string[];
  readonly path: string;
  onRouteChange(payload: RouterEvents[keyof RouterEvents]): void;
}

export type RouterEvents = {
  "route:change": RouteUpdate;
};

export type QP = {
  value: URLSearchParams;
  toString(): string | undefined;
};

export type RouteUpdateType = "PUSH" | "POP" | "REPLACE";

type RouteUpdate = {
  type: RouteUpdateType;
  url?: string;
  state?: Serializable;
  query: QP;
  pathFragments: string[];
};

export type RouteState = Serializable & {};
