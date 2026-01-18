import type { default as N_ary } from "@platform/types/interfaces/n-ary.interface";

export type NavItem = {
  id: string;
  parentId: string | null;
  kind: InfrastructureType;
  name: string;
  status: Status;
  meta: {
    cpu?: number;
    ram?: number;
    ip?: string;
  };
};

// --- Types ---
export type InfrastructureType =
  | "cloud"
  | "region"
  | "zone"
  | "cluster"
  | "pod";
export type Status = "active" | "degraded" | "offline" | "booting";

export type NavData = {
  state: Set<string> | undefined;
  tree: N_ary<NavItem> | undefined;
  root: HTMLElement | Element | null;
};

export type Scaffolder = {
  data: NavItem[];
  container: Element | HTMLElement | null;
};
export type Scaffolding = {
  tree: N_ary<NavItem>;
  container: Element | HTMLElement | null;
};
