/**
 * CloudCommand Mock Server V1 (Approved)
 * Features: Bucket Partitioning, Stateful Chaos, and Infrastructure Drift.
 */
import { WebSocketServer, WebSocket } from "ws";
import crypto from "node:crypto"; // Explicit import for safety
import { Server } from "node:http";
import { type Static } from "@sinclair/typebox";
import { AddressInfo } from "net";
import { ConsoleSchema } from "@tesseract/schema";
type NavItem = Static<typeof ConsoleSchema.NavItemSchema>;

const PORT = 17000;

// --- 1. Tuning (The "Pulse") ---
const TICK_RATE_MS = 500; // 2 updates per second (Visual smoothness)
const MSGS_PER_TICK = 50; // ~100 events/second total

const DRIFT_RATE_MS = 5000; // Every 5 seconds, the world changes slightly
const DRIFT_AMOUNT = 5; // Number of nodes that change state per drift tick

// --- 2. Cluster Composition ---
const CRITICAL_PCT = 0.05; // 5% of fleet is dying
const WARNING_PCT = 0.09; // 9% of fleet is degraded

// --- 3. Traffic Distribution (Weighted) ---
// Even if a node is Critical, it mostly sends Logs, sometimes Alerts.
const TRAFFIC_PROB = {
  critical: 0.15, // 15% chance of picking a Critical node to emit event
  warning: 0.25,
  info: 0.6,
};

const SEVERITY_MAP: Record<string, number> = {
  critical: 3,
  warning: 2,
  info: 1,
};

// --- Vocabulary & Runbooks ---

const LOG_LEVELS = {
  critical: ["CRITICAL", "FATAL"],
  warning: ["WARNING", "WARN"],
  info: ["INFO"],
};

const TEAMS = ["platform", "checkout", "search", "frontend", "data-science"];
const REGIONS = ["us-east-1", "eu-west-1", "ap-south-1", "ca-central-1"];

const ALERT_DEFINITIONS: Record<string, any[]> = {
  critical: [
    {
      code: "K8S_NODE_NOT_READY",
      type: "NodeNotReady",
      suggestion: "Check kubelet status.",
      runbookUrl:
        "https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubenodenotready",
    },
    {
      code: "K8S_CRASHLOOP",
      type: "CrashLoopBackOff",
      suggestion: "Inspect pod logs.",
      runbookUrl:
        "https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubepodcrashlooping",
    },
    {
      code: "NET_PARTITION",
      type: "NetworkPartition",
      suggestion: "Verify CNI plugin.",
      runbookUrl:
        "https://github.com/kubernetes-monitoring/kubernetes-mixin/blob/master/runbook.md",
    },
    {
      code: "PVC_LOST",
      type: "PVCLost",
      suggestion: "Check storage backend.",
      runbookUrl:
        "https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubepersistentvolumeclaimlost",
    },
  ],
  warning: [
    {
      code: "HOST_HIGH_CPU",
      type: "HighCPU",
      suggestion: "Check runaway processes.",
      runbookUrl:
        "https://runbooks.prometheus-operator.dev/runbooks/node/nodecpuusage",
    },
    {
      code: "HOST_HIGH_MEM",
      type: "HighMemory",
      suggestion: "Monitor OOM kills.",
      runbookUrl:
        "https://runbooks.prometheus-operator.dev/runbooks/node/nodememoryusage",
    },
    {
      code: "DB_SLOW_QUERY",
      type: "SlowQueries",
      suggestion: "Analyze query plans.",
      runbookUrl:
        "https://samber.github.io/awesome-prometheus-alerts/rules.html",
    },
    {
      code: "K8S_IMAGE_PULL",
      type: "ImagePullBackOff",
      suggestion: "Verify registry creds.",
      runbookUrl:
        "https://stackoverflow.com/questions/32507636/kubernetes-imagepullbackoff",
    },
  ],
  info: [
    {
      code: "SYS_UPGRADE",
      type: "VersionUpgradeAvailable",
      suggestion: "Schedule maintenance.",
      runbookUrl:
        "https://kubernetes.io/docs/tasks/administer-cluster/cluster-upgrade/",
    },
    {
      code: "SEC_CERT_RENEW",
      type: "CertificateRenewal",
      suggestion: "Verify cert-manager.",
      runbookUrl: "https://cert-manager.io/docs/troubleshooting/",
    },
    {
      code: "OPS_BACKUP",
      type: "BackupComplete",
      suggestion: "Audit backup integrity.",
      runbookUrl: "https://velero.io/docs/v1.9/troubleshooting/",
    },
  ],
};

const HEALTHY_MSGS = [
  "Health check passed",
  "Metrics flushed",
  "Cache refreshed",
  "Transaction committed",
];
const WARNING_MSGS = [
  "Response degraded (>500ms)",
  "Garbage collection >100ms",
  "Retrying connection",
  "Disk usage 75%",
];
const CRITICAL_MSGS = [
  "ECONNREFUSED",
  "NullPointerException",
  "Deadlock detected",
  "OOMKilled",
];

// --- Helpers ---
const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// --- Generators ---

function generateStrictLog(state: "critical" | "warning" | "info") {
  const timestamp = new Date().toISOString();
  let level, msg;

  if (state === "critical") {
    level = rand(LOG_LEVELS.critical);
    msg = rand(CRITICAL_MSGS);
  } else if (state === "warning") {
    level = rand(LOG_LEVELS.warning);
    msg = rand(WARNING_MSGS);
  } else {
    level = rand(LOG_LEVELS.info);
    msg = rand(HEALTHY_MSGS);
  }
  return {
    id: `log-${crypto.randomUUID()}`,
    message: `[${timestamp}] [${level}] ${msg} [trace:${Math.random().toString(16).substr(2, 6)}]`,
  };
}

function generateStrictAlert(
  resourceId: string,
  state: "critical" | "warning" | "info",
) {
  const definition = rand(ALERT_DEFINITIONS[state]);
  const team = rand(TEAMS);
  const region = rand(REGIONS);

  return JSON.stringify({
    kind: "alert:dispatch",
    resourceId: resourceId,
    id: `alert-${crypto.randomUUID()}`,
    message: `${definition.type}: Detected on ${resourceId}`,
    priority: SEVERITY_MAP[state],
    severity: state,
    code: definition.code,
    origin: "cloud-command-agent",
    suggestion: definition.suggestion,
    runbookUrl: definition.runbookUrl,
    labels: { team, region, environment: "production", app: "cloud-console" },
  });
}

const createLogPayload = (
  id: string,
  state: "critical" | "warning" | "info",
) => {
  let batchSize = 1;
  if (state === "critical")
    batchSize = randInt(5, 10); // Critical nodes are noisy
  else if (state === "warning") batchSize = randInt(2, 4);

  const logs = Array.from({ length: batchSize }, () =>
    generateStrictLog(state),
  );
  return JSON.stringify({ kind: "log:dispatch", resourceId: id, logs });
};

const createStatusPayload = (
  id: string,
  state: "critical" | "warning" | "info",
) => {
  let status = "active";
  if (state === "critical") status = rand(["offline", "degraded"]);
  else if (state === "warning") status = "degraded";
  return JSON.stringify({ kind: "status:update", id, status });
};

/**
 * The Chaos Engine
 * Fires events based on bucket probability.
 */
function firehose(
  ws: WebSocketServer,
  buckets: { critical: string[]; warning: string[]; info: string[] },
) {
  for (let i = 0; i < MSGS_PER_TICK; i++) {
    const trafficRoll = Math.random();
    let targetId: string;
    let state: "critical" | "warning" | "info";

    // Weighted selection: Critical/Warning nodes generate disproportionately more events
    if (trafficRoll <= TRAFFIC_PROB.critical && buckets.critical.length > 0) {
      targetId = rand(buckets.critical);
      state = "critical";
    } else if (
      trafficRoll <= TRAFFIC_PROB.critical + TRAFFIC_PROB.warning &&
      buckets.warning.length > 0
    ) {
      targetId = rand(buckets.warning);
      state = "warning";
    } else {
      // Fallback to info if other buckets are empty
      if (buckets.info.length > 0) {
        targetId = rand(buckets.info);
        state = "info";
      } else return; // Should not happen
    }

    const typeRoll = Math.random();
    let payload;

    if (typeRoll < 0.7) {
      payload = createLogPayload(targetId, state);
    } else if (typeRoll < 0.9) {
      payload = createStatusPayload(targetId, state);
    } else {
      payload = generateStrictAlert(targetId, state);
    }

    ws.clients.forEach((client) => {
      client.send(payload);
    });
  }
}

/**
 * The Drift Engine
 * Moves nodes between buckets to simulate infrastructure evolution.
 */
function drift(buckets: {
  critical: string[];
  warning: string[];
  info: string[];
}) {
  // 1. Healing: Critical -> Info
  for (let i = 0; i < DRIFT_AMOUNT; i++) {
    if (buckets.critical.length > 0) {
      const recoveredNode = buckets.critical.pop();
      if (recoveredNode) buckets.info.push(recoveredNode);
    }
  }

  // 2. Degradation: Info -> Warning
  for (let i = 0; i < DRIFT_AMOUNT; i++) {
    if (buckets.info.length > 0) {
      const failingNode = buckets.info.shift(); // Take from start
      if (failingNode) buckets.warning.push(failingNode);
    }
  }

  // 3. Escalation: Warning -> Critical
  for (let i = 0; i < Math.floor(DRIFT_AMOUNT / 2); i++) {
    if (buckets.warning.length > 0) {
      const criticalNode = buckets.warning.pop();
      if (criticalNode) buckets.critical.push(criticalNode);
    }
  }
}

// --- Connection Handler ---

export function openSocket(server: Server, response: NavItem[]) {
  const wss = new WebSocketServer({ server, path: "/cloud-console" });
  let tickLoop: NodeJS.Timeout | null = null;
  let driftLoop: NodeJS.Timeout | null = null;

  function broadcast() {
    // State Buckets
    const buckets = {
      critical: [] as string[],
      warning: [] as string[],
      info: [] as string[],
    };

    try {
      const accumulator: { ids: string[] } = {
        ids: [],
      };
      const data = response.reduce((acc, current) => {
        acc.ids.push(current.id);
        return acc;
      }, accumulator);
      if (data.ids) {
        const allIds: string[] = data.ids;
        console.log(`Subscribed: ${allIds.length} nodes`);

        // 1. Initial Partitioning
        const shuffled = [...allIds].sort(() => 0.5 - Math.random());
        const cCount = Math.floor(allIds.length * CRITICAL_PCT);
        const wCount = Math.floor(allIds.length * WARNING_PCT);

        buckets.critical = shuffled.slice(0, cCount);
        buckets.warning = shuffled.slice(cCount, cCount + wCount);
        buckets.info = shuffled.slice(cCount + wCount);

        // 2. Start The Firehose
        if (tickLoop) clearInterval(tickLoop);
        tickLoop = setInterval(() => firehose(wss, buckets), TICK_RATE_MS);

        // 3. Start The Drift (Simulate Healing/Breaking)
        if (driftLoop) clearInterval(driftLoop);
        driftLoop = setInterval(() => drift(buckets), DRIFT_RATE_MS);
      }
    } catch (e) {
      console.error("Message error:", e);
    }
  }
  broadcast();
  wss.on("connection", (ws: WebSocket) => {
    console.log("CLIENT CONNECTED");
  });

  const address = server.address() as AddressInfo;
  console.log(`Mock Server running on port ${address?.port}`);
}
