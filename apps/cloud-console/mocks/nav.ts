// FIX: Import from the new Strict Contract
import type { NavItem } from "@cloud-types/sidebar.types";

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
 * * POLICY: All nodes start as "active".
 * Degradation is strictly event-driven via the Socket.
 */
export const fetchInfrastructureNav = (): Promise<NavItem[]> => {
  return new Promise((resolve) => {
    console.log("MockDB: Generating 16k+ nodes...");

    // Simulate Network Latency (300ms)
    setTimeout(() => {
      const dataset: NavItem[] = [];
      let podCounter = 0;

      // 1. Root Node
      dataset.push({
        kind: "cloud",
        id: "cloud-root",
        name: "Global Infrastructure",
        status: "active", // <--- Clean State
        parentId: null,
        meta: {},
      });

      // 2. Generate Hierarchy
      for (let r = 1; r <= CONFIG.regions; r++) {
        const rId = `region-${r}`;
        dataset.push({
          kind: "region",
          id: rId,
          name: `US-East-${r}`,
          status: "active",
          parentId: "cloud-root",
          meta: {},
        });

        for (let z = 1; z <= CONFIG.zonesPerRegion; z++) {
          const zId = `${rId}-zone-${z}`;
          dataset.push({
            kind: "zone",
            id: zId,
            name: `Zone ${z}`,
            status: "active",
            parentId: rId,
            meta: {},
          });

          for (let c = 1; c <= CONFIG.clustersPerZone; c++) {
            const cId = `${zId}-cluster-${c}`;
            dataset.push({
              kind: "cluster",
              id: cId,
              name: `K8s-Cluster-${c}`,
              status: "active",
              parentId: zId,
              meta: { ip: `10.0.${r}.${c}` },
            });

            for (let p = 1; p <= CONFIG.podsPerCluster; p++) {
              podCounter++;
              const pId = `${cId}-pod-${p}`;
              dataset.push({
                kind: "pod",
                id: pId,
                name: `pod-${podCounter.toString(16)}`,
                status: "active",
                parentId: cId,
                meta: {
                  // We can keep static meta, but status remains active
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
