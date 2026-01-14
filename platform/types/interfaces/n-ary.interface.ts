export interface N_ary_Node<T> {
  id: string;
  value: T; // The Generic Payload
  children: N_ary_Node<T>[];
  parentId: string | null; // Critical for "bubbling up" status updates
}

export interface N_Ary_Static {
  from<T>(data: T[]): N_Ary<T>;
  new <T>(): N_Ary<T>;
}

export default interface N_Ary<T> {
  root: N_ary_Node<T> | null;
  size: number;

  nodes: Map<string, N_ary_Node<T>>;

  // O(1) Lookup via Map
  find(target: string | N_ary_Node<T>): N_ary_Node<T> | null;

  // O(1) Insertion (if we have the Map)
  insert(
    parentId: string | null,
    node: T | N_ary_Node<T>
  ): N_ary_Node<T> | null;

  remove(target: string | N_ary_Node<T>): boolean;

  lineage(target: string): N_ary_Node<T>[];
}
