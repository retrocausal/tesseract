import { TOptional, Type, type TObject } from "@sinclair/typebox";
import { ConsoleSchema } from "@tesseract/schema";
function WithPrivate<T extends TObject>(schema: T) {
  type Shape = T["properties"];

  type Cast = TObject<
    {
      [K in keyof Shape]: Shape[K];
    } & {
      [K in keyof Shape as `_${string & K}`]: TOptional<Shape[K]>;
    }
  >;

  // Access the actual schema property definitions
  const properties = schema.properties;
  const keys = Object.keys(properties);

  const wrapped = keys.reduce((acc, key) => {
    acc[key] = properties[key];
    acc[`_${key}`] = Type.Optional(properties[key]);
    return acc;
  }, {} as any);

  return Type.Object(wrapped) as Cast;
}

const CloudConsoleStateSchema = Type.Object({
  infra: Type.Array(ConsoleSchema.NavItemSchema),
});

export const TenantStateMapSchema = Type.Object({
  "cloud-console": WithPrivate(CloudConsoleStateSchema),
});
