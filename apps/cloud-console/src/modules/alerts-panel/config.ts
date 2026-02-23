/**
 * a limit of 100 events held in state
 * a buffer of 20 - show top 20 items as events gget ingested constantly
 * a time interval of 200 ms - so, every 200 ms, we pop 20 from heap.
 * leading to a total of 100 events shown per sec - matches the rate at which backend sends updates
 */

import { Alert } from "@cloud-types/alerts.ui.types";

const LIMIT = 100;
const BUFFER = 20;
const TIMEINTERVAL = 200;
const RELEGATIONS: Record<Alert["severity"], number> = {
  info: 200,
  warning: 360,
  critical: 500,
};

export default { LIMIT, BUFFER, TIMEINTERVAL, RELEGATIONS } as const;
