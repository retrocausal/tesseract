import type GenericHeap from "@platform-types/interfaces/heap";
import type { ComparatorFn } from "@platform-types/interfaces/heap";

abstract class Heap<T> implements GenericHeap<T> {
  protected collection: T[] = new Array();
  public get size() {
    return this.collection.length;
  }
  public comparator: ComparatorFn<T>;
  protected abstract swap(index1: number, index2: number): void;
  public abstract pop(): T | undefined;
  public abstract add(item: T): void;
  public abstract children(parent: number): number[];
  public abstract parent(child: number): number | undefined;

  constructor(comparator: ComparatorFn<T>) {
    this.comparator = comparator;
  }
}

export default Heap;
