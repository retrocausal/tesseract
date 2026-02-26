/**
 * a limit of 1000 alerts held in state - so 1000 dom nodes reserved, filling at 50 a sec - takes 20 seconds to fill
 * a buffer of 25 - show top 25 ingested items as alerts get ingested constantly
 * a time interval of 500 ms - so, every 500 ms, we pop 25 from heap.
 * leading to a total of 50 alerts shown per sec - half the rate at which backend sends updates
 * the heap is configured to retain as many as 72000 alerts ~ about 720 seconds / 12minutes of buffer if drain stops
 * 1000 every 20 seconds is 50 per second. that a deficit of 50 per second. in a cascading event
 * the deficit may rize thrice as much. say 150 to 200 per second.
 * in a happy scenario, deficit of 50 per second means, heap is ingesting 150 alerts per second
 * reaching its max size by 72000/150 ~ 8 minutes.
 * in a worst case scenario, at 200 deficit per second, it fill up in 72000/300 ~ 3 to 4 minutes
 * we can configure for a higher tick rate, but this current config gives the user some breathing space to
 * notice a critical alert before it ticks off viewport. user can always hoverto pause rndering and scroll
 */

import { Alert } from "@cloud-types/alerts.ui.types";
const MAX_HEAP_SIZE = 72000;
const LIMIT = 1000;
const BUFFER = 25;
const TIMEINTERVAL = 500;
const RELEGATIONS: Record<Alert["severity"], number> = {
  info: Math.round(MAX_HEAP_SIZE / 5),
  warning: Math.round(MAX_HEAP_SIZE / 3),
  critical: MAX_HEAP_SIZE,
};

export default {
  LIMIT,
  BUFFER,
  TIMEINTERVAL,
  RELEGATIONS,
  MAX_HEAP_SIZE,
} as const;
