import { type TOptional, type TString, Type } from "@sinclair/typebox";

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
