import type { NavItem as FlatNode } from "@cloud/types/sidebar";

// --- Configuration ---
// Scale: 5 Regions * 5 Zones * 25 Clusters * 25 Pods = ~16,000 Nodes
const CONFIG = {
  regions: 5,
  zonesPerRegion: 5,
  clustersPerZone: 25,
  podsPerCluster: 25,
};

/**
 * Simulates a Database Dump or API Response.
 * Returns a massive, flat, unordered array of infrastructure nodes.
 */
export const fetchInfrastructureNav = (): Promise<FlatNode[]> => {
  return new Promise((resolve) => {
    console.log("MockDB: Generating 16k+ nodes...");

    // Simulate Network Latency (300ms)
    setTimeout(() => {
      const dataset: FlatNode[] = [];
      let podCounter = 0;

      // 1. Root Node
      dataset.push({
        id: "cloud-root",
        parentId: null,
        kind: "cloud",
        name: "Global Infrastructure",
        status: "active",
        meta: {},
      });

      // 2. Generate Hierarchy
      for (let r = 1; r <= CONFIG.regions; r++) {
        const rId = `region-${r}`;
        dataset.push({
          id: rId,
          parentId: "cloud-root",
          kind: "region",
          name: `US-East-${r}`,
          status: "active",
          meta: {},
        });

        for (let z = 1; z <= CONFIG.zonesPerRegion; z++) {
          const zId = `${rId}-zone-${z}`;
          dataset.push({
            id: zId,
            parentId: rId,
            kind: "zone",
            name: `Zone ${z}`,
            status: Math.random() > 0.9 ? "degraded" : "active",
            meta: {},
          });

          for (let c = 1; c <= CONFIG.clustersPerZone; c++) {
            const cId = `${zId}-cluster-${c}`;
            dataset.push({
              id: cId,
              parentId: zId,
              kind: "cluster",
              name: `K8s-Cluster-${c}`,
              status: Math.random() > 0.85 ? "degraded" : "active",
              meta: { ip: `10.0.${r}.${c}` },
            });

            for (let p = 1; p <= CONFIG.podsPerCluster; p++) {
              podCounter++;
              const pId = `${cId}-pod-${p}`;
              dataset.push({
                id: pId,
                parentId: cId,
                kind: "pod",
                name: `pod-${podCounter.toString(16)}`,
                status: Math.random() > 0.95 ? "offline" : "active",
                meta: {
                  cpu: Math.floor(Math.random() * 100),
                  ram: Math.floor(Math.random() * 1024),
                },
              });
            }
          }
        }
      }

      // 3. CHAOS SHUFFLE (Fisher-Yates)
      // We purposefully scramble the array so children might appear before parents.
      // This forces the N-Ary Tree to handle non-topological ingestion.
      let currentIndex = dataset.length,
        randomIndex;
      while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [dataset[currentIndex], dataset[randomIndex]] = [
          dataset[randomIndex],
          dataset[currentIndex],
        ];
      }

      console.log(`MockDB: Generated ${dataset.length} nodes. Payload ready.`);
      resolve(dataset);
    }, 300);
  });
};
