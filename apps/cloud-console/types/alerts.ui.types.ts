import BinaryHeap from "@tesseract/platform/structures/heap.struct"; // Import class for the Type
import { type Static } from "@sinclair/typebox";
import { ConsoleSchema } from "@tesseract/schema";

const { AlertPanelStateSchema, AlertSchema } = ConsoleSchema;

// --------------------------------------------------------------------------
// 2. INFERRED TYPES
// --------------------------------------------------------------------------

export type Alert = Static<typeof AlertSchema>;
export type AlertPanelState = Static<typeof AlertPanelStateSchema>;

// --------------------------------------------------------------------------
// 3. RUNTIME INTERFACES (DOM / Classes)
// --------------------------------------------------------------------------

export type AlertScaffolding = {
  state: AlertPanelState;
  heap: BinaryHeap<Alert>; // Uses the Inferred Alert Type
  root: HTMLUListElement;
};
