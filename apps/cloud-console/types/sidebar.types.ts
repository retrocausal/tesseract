import { Type, type Static, type TSchema } from "@sinclair/typebox";
import type { N_ary_Node } from "@platform/types/interfaces/n-ary.interface";
import type { default as N_ary } from "@platform/types/interfaces/n-ary.interface";
import type { Resolver, Subscriber } from "@cloud-types/router.types";

type Implements<T, U extends T> = U;

// 1. Define Strict Statuses
export const NavItemStatusSchema = Type.Union([
  Type.Literal("active"),
  Type.Literal("degraded"),
  Type.Literal("maintenance"),
  Type.Literal("offline"),
  Type.Literal("unknown"),
]);

export const NavItemKindSchema = Type.Union([
  Type.Literal("cloud"),
  Type.Literal("region"),
  Type.Literal("zone"),
  Type.Literal("cluster"),
  Type.Literal("pod"),
  Type.Literal("service"),
]);

export const NavItemMetaSchema = Type.Record(
  Type.String(),
  Type.Union([Type.String(), Type.Number(), Type.Boolean(), Type.Date()]),
);

export const NavItemSchema = Type.Object({
  id: Type.String(),
  parentId: Type.Union([Type.String(), Type.Null()]),
  kind: NavItemKindSchema,
  name: Type.String(),
  status: NavItemStatusSchema,
  meta: NavItemMetaSchema,
});

export type NavItem = Static<typeof NavItemSchema>;

const NavItemNodeProducer = <T extends TSchema>(ItemSchema: T) =>
  Type.Recursive((Self) =>
    Type.Object({
      id: Type.String(),
      value: ItemSchema,
      parentId: Type.Union([Type.String(), Type.Null()]),
      children: Type.Array(Self),
    }),
  );

export const NavItemNodeSchema = NavItemNodeProducer(NavItemSchema);
export type NavItemNode = Static<typeof NavItemNodeSchema>;

// We are effectively saying: "Assert that NavItemNode extends N_ary_Node<NavItem>"
export type _Validation = Implements<N_ary_Node<NavItem>, NavItemNode>;

// --------------------------------------------------------------------------
// 4. RUNTIME INTERFACES
// --------------------------------------------------------------------------

type NavItemTree = N_ary<NavItem>;

export type NavData = {
  state: Set<string> | undefined;
  tree: NavItemTree | undefined;
  root: HTMLElement | Element | null;
};

export type Scaffolder = {
  data: NavItem[];
  container: Element | HTMLElement | null;
};

export type NavScaffolding = {
  tree: NavItemTree;
  container: Element | HTMLElement | null;
};

export type RouterPlugs = {
  onURIChange?: Resolver;
  onRouteUpdate?: Subscriber;
  [key: string]: Subscriber | Resolver | undefined;
};
