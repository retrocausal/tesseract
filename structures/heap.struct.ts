import Heap from "@common-types/abstracts/heap.abstract";

/**
 * [1,2,3,4,5,6,7,8,9]
 * 1(0th)->2,3 ->begins at 2(1st) - 2*0+1
 * 2(1st)->4,5 ->begins at 4(3rd) - 2*1 + 1
 * 3(2nd)->6,7 ->begins at 6(5th) - 2*2 + 1
 * children = [2*index+2,2*index+1]
 * ***** Parents*****
 * 9 - 2*x +1 = index of 9 = 8;
 * 2x+1=8; 2x = 8-1; x = (8-1)/2
 * (index - 1)/2 if first child
 * (index - 2)/2 if second child
 * 7/2 = 3.5; 6/2 = 3;
 * since the children for a given index are at 2i+1,2i+2,
 * first child is odd indexed and second is even indexed for all parents;
 * the last parent index would be if length is even(i is odd), i-1/2, else(i is even) i-2/2: i=length-1;
 * so if length is even, then i is odd and odd-1 is even and even is divisible by 2. always a whole number
 * but if length is odd, then i is even and even -2 is the same as i-1(odd)-1/2;
 * so we do i-1/2 for all indices and round it down.
 */

class BinaryHeap<T> extends Heap<T> {
  protected swap(index1: number, index2: number): void {
    if (index1 >= 0 && index2 >= 0 && index1 !== index2) {
      const temp = this.collection[index1];
      this.collection[index1] = this.collection[index2];
      this.collection[index2] = temp;
    }
  }

  public parent(child: number): number | undefined {
    let index;
    if (child >= 0 && child < this.size) {
      const i = Math.floor((child - 1) / 2);
      index = i >= 0 ? i : undefined;
    }
    return index;
  }
  public children(parent: number): number[] {
    let indices = new Array();
    if (this.size && parent >= 0 && parent < this.size) {
      const index = 2 * parent + 1;
      if (index < this.size) {
        indices.push(index);
      }
      if (index + 1 < this.size) {
        indices.push(index + 1);
      }
    }
    return indices;
  }
  private sift(): void {
    if (this.size > 0) {
      let parent = 0;
      const children = this.children(parent);
      if (children.length) {
        let [C1, C2] = children;
        while (C1 !== undefined || C2 !== undefined) {
          let swappable;
          if (C1 !== undefined && C2 !== undefined) {
            const result = this.comparator(
              this.collection[C1],
              this.collection[C2]
            );
            if (result > 0) {
              swappable = C2;
            } else swappable = C1;
          } else {
            swappable = C1 !== undefined ? C1 : C2;
          }
          const result = this.comparator(
            this.collection[parent],
            this.collection[swappable]
          );
          if (result > 0) {
            this.swap(parent, swappable);
            parent = swappable;
            const children = this.children(parent);
            [C1, C2] = children;
          } else break;
        }
      }
    }
  }
  public pop(): T | undefined {
    let poppable;
    if (this.size > 0) {
      this.swap(0, this.size - 1);
      poppable = this.collection.pop();
      this.sift();
    }
    return poppable;
  }
  private bubble(): void {
    let index = this.size - 1;
    let parent = this.parent(index);
    while (parent !== undefined) {
      const result = this.comparator(
        this.collection[parent],
        this.collection[index]
      );
      if (result > 0) {
        this.swap(parent, index);
        index = parent;
        parent = this.parent(index);
      } else break;
    }
  }
  public add(item: T): void {
    this.collection.push(item);
    this.bubble();
  }
}

export default BinaryHeap;
