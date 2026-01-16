type SerializablePrimitive =
  | string
  | number
  | boolean
  | null
  | undefined
  | bigint
  | Date
  | RegExp;

export type SerializableValue =
  | SerializablePrimitive
  | SerializableValue[]
  | { [key: string]: SerializableValue }
  | Map<SerializableValue, SerializableValue>
  | Set<SerializableValue>;

export type Serializable = { [key: string]: SerializableValue };
