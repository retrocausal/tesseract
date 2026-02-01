import { Type, type TSchema } from "@sinclair/typebox";

// 1. Define Strict Statuses
export const NavItemStatusSchema = Type.Union([
  Type.Literal("active"),
  Type.Literal("degraded"),
  Type.Literal("booting"),
  Type.Literal("offline"),
]);

export const NavItemKindSchema = Type.Union([
  Type.Literal("cloud"),
  Type.Literal("region"),
  Type.Literal("zone"),
  Type.Literal("cluster"),
  Type.Literal("pod"),
  Type.Literal("service"),
]);

export const NavItemMetaSchema = Type.Record(
  Type.String(),
  Type.Union([Type.String(), Type.Number(), Type.Boolean(), Type.Date()]),
);

export const NavItemSchema = Type.Object({
  id: Type.String(),
  parentId: Type.Union([Type.String(), Type.Null()]),
  kind: NavItemKindSchema,
  name: Type.String(),
  status: NavItemStatusSchema,
  meta: NavItemMetaSchema,
});

export const NavItemNodeProducer = <T extends TSchema>(ItemSchema: T) =>
  Type.Recursive((Self) =>
    Type.Object({
      id: Type.String(),
      value: ItemSchema,
      parentId: Type.Union([Type.String(), Type.Null()]),
      children: Type.Array(Self),
    }),
  );
