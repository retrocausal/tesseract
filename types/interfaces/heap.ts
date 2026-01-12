interface GenericHeap<T> {
  children(parent: number): number[];
  parent(child: number): number | undefined;
  pop(): T | undefined;
  add(item: T): void;
  readonly comparator: ComparatorFn<T>;
}

export type ComparatorFn<T> = (P: T, C: T) => number;

export default GenericHeap;
