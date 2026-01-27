import {
  type TOptional,
  type TString,
  Type,
  type Static,
} from "@sinclair/typebox";
import type {
  RouteUpdateType,
  QP,
} from "@platform/types/interfaces/platform-router.interface";
import type { Serializable } from "@platform/types/interfaces/serializable.interface";

// We define the keys ONCE. Everything else is generated from this.
export const ROUTE_KEYS = {
  RESOURCE: "RESOURCE",
  ALERT: "ALERT",
  LOG: "LOG",
} as const;
type RouteKey = (typeof ROUTE_KEYS)[keyof typeof ROUTE_KEYS];
export const RouteIdentifierSchema = Type.Union(
  Object.keys(ROUTE_KEYS).map((k) => Type.Literal(k as RouteKey)),
);

export const GreppedInfoSchema = Type.Object({
  key: RouteIdentifierSchema,
  value: Type.String(),
});

const _NavMapProps = Object.keys(ROUTE_KEYS).reduce(
  (acc, key) => {
    const id = key as RouteKey;
    acc[id] = Type.Optional(Type.String());
    return acc;
  },
  {} as Partial<Record<RouteKey, TOptional<TString>>>,
) as Record<RouteKey, TOptional<TString>>;
export const NavMapSchema = Type.Object(_NavMapProps, {
  additionalProperties: false,
});

// --------------------------------------------------------------------------
// 3. INFERRED TYPES
// --------------------------------------------------------------------------

export type RouteIdentifier = Static<typeof RouteIdentifierSchema>;
export type GreppedInfo = Static<typeof GreppedInfoSchema>;
export type NavMap = Static<typeof NavMapSchema>;

// --------------------------------------------------------------------------
// 4. RUNTIME INTERFACES
// --------------------------------------------------------------------------

export type RouteUpdate = {
  type: RouteUpdateType;
  state: Serializable;
  query: QP;
  path: string;
  relativePath: string | undefined;
  routeCaptures: GreppedInfo[];
};

export type AppRouteEvents = {
  "cloud:route:update": RouteUpdate;
};

export type RouteDefinition = {
  route(identifiers: NavMap): string;
  captureExpression: RegExp;
};

export type Routes = Record<RouteIdentifier, RouteDefinition>;
export type Greppers = Record<RouteIdentifier, RegExp>;

export type Resolver = (V: string) => void;
export type Subscriber = (T: RouteUpdate) => void;
export type Resolvers = Map<RouteIdentifier, Resolver[]>;
