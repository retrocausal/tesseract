import type { AlertDispatch } from "@cloud-types/emitter.types";
export interface Alert extends Partial<AlertDispatch> {
  message: string;
  priority: number;
  id: string;
  time: string;
}
