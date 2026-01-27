import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

// --------------------------------------------------------------------------
// 1. STRICT TYPE DEFINITIONS (Hand-Written to guarantee Map/Set generics)
// --------------------------------------------------------------------------

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue =
  | JSONPrimitive
  | JSONValue[]
  | { [key: string]: JSONValue };

export type BrowserPrimitive =
  | JSONPrimitive
  | undefined
  | bigint
  | Date
  | RegExp;

// The Circular Type Definition
export type SerializableValue =
  | BrowserPrimitive
  | SerializableValue[]
  | { [key: string]: SerializableValue }
  | Map<SerializableValue, SerializableValue> //  Strictly Typed
  | Set<SerializableValue>;

export type Serializable = { [key: string]: SerializableValue };

// --------------------------------------------------------------------------
// 2. SCHEMA DEFINITIONS (The Runtime Validators)
// --------------------------------------------------------------------------

// A. JSON Schema (Standard)
export const JSONValueSchema: any = Type.Recursive((Self) =>
  Type.Union([
    Type.String(),
    Type.Number(),
    Type.Boolean(),
    Type.Null(),
    Type.Array(Self),
    Type.Record(Type.String(), Self),
  ]),
);

// B. Browser/Router Schema (Custom)
export const SerializableValueSchema: any = Type.Recursive((Self) =>
  Type.Union([
    // Primitives
    Type.String(),
    Type.Number(),
    Type.Boolean(),
    Type.Null(),
    Type.Undefined(),
    Type.BigInt(),
    Type.Date(),

    // Custom: RegExp Object Validator
    Type.Unsafe<RegExp>({
      type: "object",
      instanceOf: "RegExp",
    }),

    // Structures
    Type.Array(Self),
    Type.Record(Type.String(), Self),

    // Custom: Map<Serializable, Serializable> Validator
    // We inject the explicit type <Map<SerializableValue, SerializableValue>>
    // so the inferred static type matches our hand-written type.
    Type.Unsafe<Map<SerializableValue, SerializableValue>>({
      type: "object",
      instanceOf: "Map",
      // Deep Validation: Check every Key and Value against 'Self'
      check: (v: unknown) =>
        v instanceof Map &&
        [...v.entries()].every(
          ([key, val]) => Value.Check(Self, key) && Value.Check(Self, val),
        ),
    }),

    // Custom: Set<Serializable> Validator
    Type.Unsafe<Set<SerializableValue>>({
      type: "object",
      instanceOf: "Set",
      // Deep Validation: Check every Value against 'Self'
      check: (v: unknown) =>
        v instanceof Set &&
        [...v.values()].every((val) => Value.Check(Self, val)),
    }),
  ]),
);

export const SerializableSchema = Type.Record(
  Type.String(),
  SerializableValueSchema,
);
