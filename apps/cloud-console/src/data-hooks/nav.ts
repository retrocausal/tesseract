import { Value } from "@sinclair/typebox/value";
import { Type } from "@sinclair/typebox";
import { ConsoleSchema } from "@tesseract/schema";
import { NavItem } from "@cloud-types/nav.ui.types";

const ApiResponseSchema = Type.Object({
  infra: Type.Array(ConsoleSchema.NavItemSchema),
});

export async function fetchInfra(): Promise<NavItem[]> {
  const infraResponse = await fetch("/api/mock/cloud/infrastructure", {
    method: "POST",
  });
  const data = await infraResponse.json();

  if (!Value.Check(ApiResponseSchema, data)) {
    const errors = [...Value.Errors(ApiResponseSchema, data)]
      .map((e) => `${e.path}: ${e.message}`)
      .join(", ");
    throw new Error(`Invalid API response: ${errors}`);
  }

  return data.infra; // TypeScript now knows data.infra is NavItem[]
}
