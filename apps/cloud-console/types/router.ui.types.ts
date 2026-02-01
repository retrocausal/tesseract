import type {
  RouteUpdateType,
  QP,
} from "@tesseract/platform/types/interfaces/platform-router.interface";
import type { Serializable } from "@tesseract/platform/types/interfaces/serializable.interface";
import { type Static } from "@sinclair/typebox";

import { ConsoleSchema } from "@tesseract/schema";

const { RouteIdentifierSchema, GreppedInfoSchema, NavMapSchema } =
  ConsoleSchema;

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
