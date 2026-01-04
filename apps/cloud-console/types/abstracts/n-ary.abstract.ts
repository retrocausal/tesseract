import type N_Ary from "@cloud/types/interfaces/n-ary.interface";
import type { N_ary_Node } from "@cloud/types/interfaces/n-ary.interface";

export default abstract class N_Ary_Template<T> implements N_Ary<T> {
  root: N_ary_Node<T> | null = null;
  size: number = 0;
  nodes: Map<string, N_ary_Node<T>> = new Map();
  public abstract insert(
    parentId: string | null,
    node: T | N_ary_Node<T>
  ): N_ary_Node<T> | null;
  public abstract remove(target: string | N_ary_Node<T>): boolean;
  public abstract find(target: string | N_ary_Node<T>): N_ary_Node<T> | null;
  protected abstract bft(root: N_ary_Node<T> | undefined): N_ary_Node<T>[];
  protected abstract dft(root: N_ary_Node<T> | undefined): N_ary_Node<T>[];
}

export function StaticImplements<I>() {
  return (constructor: I) => {};
}
