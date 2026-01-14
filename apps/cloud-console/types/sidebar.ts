import type { default as N_ary } from "@common-types/interfaces/n-ary.interface";

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

export type EventBinder = {
  state: Set<string> | undefined;
  tree: N_ary<NavItem> | undefined;
  parent: HTMLElement | Element | null;
};

export type BootstrapConfig = {
  data: NavItem[];
  container: Element | HTMLElement | null;
};
