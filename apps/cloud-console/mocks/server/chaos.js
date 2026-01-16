/**
 * CloudCommand Mock Server
 * FIX: Guarantees Critical/Warning traffic volume using Array Partitioning
 */
import { WebSocketServer } from "ws";

const PORT = 17000;
const wss = new WebSocketServer({ port: PORT });

// --- Tuning ---
const TICK_RATE_MS = 1600;
const MSGS_PER_TICK = 60;

// 1. Cluster Composition (State distribution across 17k nodes)
const CRITICAL_PCT = 0.05; // 3% of nodes are Critical
const WARNING_PCT = 0.09; // 8% of nodes are Warning (Bumped up)

// 2. Traffic Distribution (Probability of an event coming from a specific bucket)
// We artificially inflate this so you actually SEE the alerts in the stream.
const TRAFFIC_PROB = {
  critical: 0.15, // 15% of all messages will come from Critical nodes
  warning: 0.25, // 25% of all messages will come from Warning nodes
  info: 0.6, // 60% background noise
};

// --- Mappings ---
const SEVERITY_MAP = {
  critical: 3,
  warning: 2,
  info: 1,
};

// --- Vocabulary ---
const LOG_LEVELS = {
  critical: ["CRITICAL", "FATAL"],
  warning: ["WARNING", "WARN"],
  info: ["INFO"],
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
const ALERT_TYPES = {
  critical: ["NodeNotReady", "CrashLoopBackOff", "NetworkPartition", "PVCLost"],
  warning: ["HighCPU", "HighMemory", "SlowQueries", "ImagePullBackOff"],
  info: ["VersionUpgradeAvailable", "CertificateRenewal", "BackupComplete"],
};

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
  return `[${timestamp}] [${level}] ${msg} [trace:${Math.random()
    .toString(16)
    .substr(2, 6)}]`;
}

function generateStrictAlert(id, state) {
  return JSON.stringify({
    kind: "alert:dispatch",
    id,
    alerts: [`${rand(ALERT_TYPES[state])}: Detected on ${id}`],
    priority: SEVERITY_MAP[state],
    severity: state,
  });
}

const createLogPayload = (id, state) => {
  // Critical = spammy (5-10 logs)
  // Warning = moderate (2-4 logs)
  // Info = quiet (1 log)
  let batchSize = 1;
  if (state === "critical") batchSize = randInt(5, 10);
  else if (state === "warning") batchSize = randInt(2, 4);

  const logs = Array.from({ length: batchSize }, () =>
    generateStrictLog(state)
  );
  return JSON.stringify({ kind: "log:dispatch", id, logs });
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
  // Partitioned Arrays for O(1) Access
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

        // 1. Shuffle to ensure random distribution
        const shuffled = [...allIds].sort(() => 0.5 - Math.random());

        // 2. Partition IDs into explicit buckets
        const cCount = Math.floor(allIds.length * CRITICAL_PCT);
        const wCount = Math.floor(allIds.length * WARNING_PCT);

        buckets.critical = shuffled.slice(0, cCount);
        buckets.warning = shuffled.slice(cCount, cCount + wCount);
        buckets.info = shuffled.slice(cCount + wCount);

        console.log(
          `Partitioned: ${buckets.critical.length} Critical, ${buckets.warning.length} Warning, ${buckets.info.length} Healthy.`
        );

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
    // 1. Select Bucket based on Probability
    // We explicitly bias the random roll to hit Critical/Warning buckets more often
    const trafficRoll = Math.random();
    let targetId, state;

    if (trafficRoll < TRAFFIC_PROB.critical && buckets.critical.length > 0) {
      targetId = rand(buckets.critical);
      state = "critical";
    } else if (
      trafficRoll < TRAFFIC_PROB.critical + TRAFFIC_PROB.warning &&
      buckets.warning.length > 0
    ) {
      targetId = rand(buckets.warning);
      state = "warning";
    } else {
      targetId = rand(buckets.info);
      state = "info";
    }

    // 2. Select Event Type
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

console.log(`Distribution-Fixed Mock Server running on port ${PORT}`);
