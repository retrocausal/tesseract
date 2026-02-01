import { Type } from "@sinclair/typebox";

// --------------------------------------------------------------------------
// 1. DATA SCHEMAS (Runtime Validatable)
// --------------------------------------------------------------------------

export const SeveritySchema = Type.Union([
  Type.Literal("critical"),
  Type.Literal("warning"),
  Type.Literal("info"),
]);

export const AlertSchema = Type.Object({
  id: Type.String(),
  resourceId: Type.String(),
  message: Type.String(),
  priority: Type.Number(),
  severity: SeveritySchema,

  // Frontend Enrichment
  time: Type.String(),
  code: Type.String(),
  origin: Type.String(),
  suggestion: Type.String(),
  runbookUrl: Type.String(),
  labels: Type.Record(Type.String(), Type.String()),
});

export const AlertPanelStateSchema = Type.Object({
  stream: Type.Array(AlertSchema),
  focussedAlert: Type.Union([Type.String(), Type.Null()]),
  lastRender: Type.Union([Type.Number(), Type.Null()]),
});
