import type { N_ary_Node } from "@tesseract/platform/types/interfaces/n-ary.interface";
import type { default as N_ary } from "@tesseract/platform/types/interfaces/n-ary.interface";
import type { Resolver, Subscriber } from "@cloud-types/router.ui.types";
import { type Static } from "@sinclair/typebox";
import { ConsoleSchema } from "@tesseract/schema";

const { NavItemNodeProducer, NavItemSchema } = ConsoleSchema;

type Implements<T, U extends T> = U;

export type NavItem = Static<typeof NavItemSchema>;
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
