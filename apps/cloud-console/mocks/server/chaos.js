/**
 * CloudCommand Mock Server
 * FIX: Guarantees Critical/Warning traffic volume using Array Partitioning
 * ENRICHED: Added Labels, Codes, and Real Runbook URLs
 */
import { WebSocketServer } from "ws";

const PORT = 17000;
const wss = new WebSocketServer({ port: PORT });

// --- Tuning ---
const TICK_RATE_MS = 1600;
const MSGS_PER_TICK = 60;

// 1. Cluster Composition
const CRITICAL_PCT = 0.05;
const WARNING_PCT = 0.09;

// 2. Traffic Distribution
const TRAFFIC_PROB = {
  critical: 0.15,
  warning: 0.25,
  info: 0.6,
};

// --- Mappings ---
const SEVERITY_MAP = {
  critical: 3,
  warning: 2,
  info: 1,
};

// --- Vocabulary & Real World Data ---

const LOG_LEVELS = {
  critical: ["CRITICAL", "FATAL"],
  warning: ["WARNING", "WARN"],
  info: ["INFO"],
};

const TEAMS = ["platform", "checkout", "search", "frontend", "data-science"];
const REGIONS = ["us-east-1", "eu-west-1", "ap-south-1", "ca-central-1"];

// REAL-WORLD RUNBOOKS
// We map specific Alert Types to their actual public documentation.
const ALERT_DEFINITIONS = {
  critical: [
    {
      code: "K8S_NODE_NOT_READY",
      type: "NodeNotReady",
      suggestion: "Check kubelet status and node connectivity.",
      runbookUrl:
        "https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubenodenotready",
    },
    {
      code: "K8S_CRASHLOOP",
      type: "CrashLoopBackOff",
      suggestion: "Inspect pod logs for application startup errors.",
      runbookUrl:
        "https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubepodcrashlooping",
    },
    {
      code: "NET_PARTITION",
      type: "NetworkPartition",
      suggestion: "Verify CNI plugin status and VPC routes.",
      runbookUrl:
        "https://github.com/kubernetes-monitoring/kubernetes-mixin/blob/master/runbook.md#alert-name-kubeproxydown",
    },
    {
      code: "PVC_LOST",
      type: "PVCLost",
      suggestion: "Check storage backend connectivity and PV status.",
      runbookUrl:
        "https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubepersistentvolumeclaimlost",
    },
  ],
  warning: [
    {
      code: "HOST_HIGH_CPU",
      type: "HighCPU",
      suggestion: "Check for runaway processes or adjust resource limits.",
      runbookUrl:
        "https://runbooks.prometheus-operator.dev/runbooks/node/nodecpuusage",
    },
    {
      code: "HOST_HIGH_MEM",
      type: "HighMemory",
      suggestion: "Monitor OOM kills and memory leak trends.",
      runbookUrl:
        "https://runbooks.prometheus-operator.dev/runbooks/node/nodememoryusage",
    },
    {
      code: "DB_SLOW_QUERY",
      type: "SlowQueries",
      suggestion: "Analyze query execution plans and index usage.",
      runbookUrl:
        "https://samber.github.io/awesome-prometheus-alerts/rules.html#postgresql",
    },
    {
      code: "K8S_IMAGE_PULL",
      type: "ImagePullBackOff",
      suggestion: "Verify image registry credentials and image tag existence.",
      runbookUrl:
        "https://stackoverflow.com/questions/32507636/kubernetes-imagepullbackoff",
    },
  ],
  info: [
    {
      code: "SYS_UPGRADE",
      type: "VersionUpgradeAvailable",
      suggestion: "Schedule maintenance window for node upgrade.",
      runbookUrl:
        "https://kubernetes.io/docs/tasks/administer-cluster/cluster-upgrade/",
    },
    {
      code: "SEC_CERT_RENEW",
      type: "CertificateRenewal",
      suggestion: "Verify automated cert-manager rotation.",
      runbookUrl: "https://cert-manager.io/docs/troubleshooting/",
    },
    {
      code: "OPS_BACKUP",
      type: "BackupComplete",
      suggestion: "Audit backup size and integrity.",
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
  "Pod scheduling failed",
];

// --- Helpers ---
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Generators ---

function generateStrictLog(state) {
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
    message: `[${timestamp}] [${level}] ${msg} [trace:${Math.random()
      .toString(16)
      .substr(2, 6)}]`,
  };
}

function generateStrictAlert(resourceId, state) {
  // 1. Pick a rich definition based on severity
  const definition = rand(ALERT_DEFINITIONS[state]);

  // 2. Random Metadata
  const team = rand(TEAMS);
  const region = rand(REGIONS);

  return JSON.stringify({
    kind: "alert:dispatch",
    resourceId: resourceId,
    id: `alert-${crypto.randomUUID()}`, // The Event ID

    // Core Data
    message: `${definition.type}: Detected on ${resourceId}`,
    priority: SEVERITY_MAP[state],
    severity: state,

    // Enrichment (The SRE Stuff)
    code: definition.code,
    origin: "cloud-command-agent",
    suggestion: definition.suggestion,
    runbookUrl: definition.runbookUrl,
    labels: {
      team,
      region,
      environment: "production",
      app: "cloud-console",
    },
  });
}

const createLogPayload = (id, state) => {
  let batchSize = 1;
  if (state === "critical") batchSize = randInt(5, 10);
  else if (state === "warning") batchSize = randInt(2, 4);

  const logs = Array.from({ length: batchSize }, () =>
    generateStrictLog(state),
  );
  return JSON.stringify({ kind: "log:dispatch", resourceId: id, logs });
};

const createStatusPayload = (id, state) => {
  let status = "active";
  if (state === "critical") status = rand(["offline", "degraded"]);
  else if (state === "warning") status = "degraded";
  return JSON.stringify({ kind: "status:update", id, status });
};

// --- Server ---

wss.on("connection", (ws) => {
  console.log("CLIENT CONNECTED");

  let loop = null;
  let buckets = {
    critical: [],
    warning: [],
    info: [],
  };

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw);

      if (data.ids && Array.isArray(data.ids)) {
        const allIds = data.ids;
        console.log(`Subscribed: ${allIds.length} nodes`);

        // Partitioning
        const shuffled = [...allIds].sort(() => 0.5 - Math.random());
        const cCount = Math.floor(allIds.length * CRITICAL_PCT);
        const wCount = Math.floor(allIds.length * WARNING_PCT);

        buckets.critical = shuffled.slice(0, cCount);
        buckets.warning = shuffled.slice(cCount, cCount + wCount);
        buckets.info = shuffled.slice(cCount + wCount);

        if (loop) clearInterval(loop);
        loop = setInterval(() => firehose(ws, buckets), TICK_RATE_MS);
      }
    } catch (e) {
      console.error(e);
    }
  });

  ws.on("close", () => {
    if (loop) clearInterval(loop);
    console.log("CLIENT DISCONNECTED");
  });
});

function firehose(ws, buckets) {
  if (ws.readyState !== 1) return;

  for (let i = 0; i < MSGS_PER_TICK; i++) {
    const trafficRoll = Math.random();
    let targetId, state;

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
      targetId = rand(buckets.info);
      state = "info";
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

    ws.send(payload);
  }
}

console.log(`Enriched Mock Server running on port ${PORT}`);
