export interface NavItem {
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
}

// --- Types ---
type InfrastructureType = "cloud" | "region" | "zone" | "cluster" | "pod";
type Status = "active" | "degraded" | "offline" | "booting";
