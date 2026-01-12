import N_Ary_Template, {
  StaticImplements,
} from "@common-types/abstracts/n-ary.abstract";
import type {
  N_ary_Node,
  N_Ary_Static,
} from "@common-types/interfaces/n-ary.interface";
import N_Ary from "@common-types/interfaces/n-ary.interface";

class NaryNode<T> implements N_ary_Node<T> {
  id: string;
  value: T;
  children: N_ary_Node<T>[] = [];
  parentId: string | null;

  constructor(id: string, value: T, parentId: string | null = null) {
    this.id = id;
    this.value = value;
    this.parentId = parentId;
  }
}
@StaticImplements<N_Ary_Static>()
class N_Ary_Tree<T> extends N_Ary_Template<T> {
  find(target: string | N_ary_Node<T>) {
    let id = "";
    if (target instanceof NaryNode) {
      id = target.id;
    } else if (typeof target === "string") {
      id = target;
    }
    let found = null;
    if (this.nodes.has(id)) {
      found = this.nodes.get(id) || null;
    }
    return found;
  }

  insert(parentId: string | null, node: T | NaryNode<T>) {
    const id =
      node instanceof NaryNode
        ? node.id
        : (node as any)?.id || crypto.randomUUID();
    let inserted = null;
    const insertable = node instanceof NaryNode ? node : new NaryNode(id, node);
    if (!this.root) {
      if (!parentId) {
        this.root = insertable;
        inserted = insertable;
      }
    } else {
      if (parentId) {
        if (this.nodes.has(parentId)) {
          const parent = this.nodes.get(parentId);
          if (parent) {
            insertable.parentId = parent.id;
            parent.children?.push(insertable);
            inserted = insertable;
          }
        }
      } else {
        throw new Error("Need a parent to attach new node to");
      }
    }
    if (inserted) {
      this.nodes.set(id, inserted);
      this.size++;
    }
    return inserted;
  }

  remove(target: string | N_ary_Node<T>) {
    let removed = false;
    const id = typeof target === "string" ? target : target.id;
    if (this.nodes.has(id)) {
      const node = this.nodes.get(id);
      if (node) {
        let parent = null;
        if (node.parentId) {
          parent = this.nodes.get(node.parentId);
        }
        if (parent && parent.children.length) {
          const index = parent.children.findIndex((i) => i.id === id);
          if (index >= 0) parent.children.splice(index, 1);
        }
        const subTreeCollection = this.bft(node);
        const length = subTreeCollection.length;
        for (let i = length - 1; i > -1; i--) {
          const item = subTreeCollection[i];
          this.nodes.delete(item.id);
          this.size--;
        }
        removed = true;
        if (this.size < 1) this.root = null;
      }
    }
    return removed;
  }

  dft(root: N_ary_Node<T>) {
    let node: N_ary_Node<T> | null = root || this.root;
    const collection: N_ary_Node<T>[] = new Array();
    if (node) {
      const processor: N_ary_Node<T>[] = new Array();
      processor.push(node);
      let current = null;
      while (processor.length) {
        current = processor.pop();
        if (current?.children.length) {
          for (let i = current.children.length - 1; i > -1; i--) {
            const child = current.children[i];
            processor.push(child);
          }
        }
        if (current) collection.push(current);
      }
    }

    return collection;
  }

  bft(root: N_ary_Node<T>) {
    let node: N_ary_Node<T> | null = root || this.root;
    const collection: N_ary_Node<T>[] = new Array();
    if (node) {
      const processor: N_ary_Node<T>[] = new Array();
      processor.push(node);
      let current = null;
      while (processor.length) {
        current = processor.shift();
        if (current?.children.length) {
          processor.push(...current.children);
        }
        if (current) collection.push(current);
      }
    }
    return collection;
  }

  static from<T>(data: T[]): N_Ary<T> {
    const tree = new N_Ary_Tree<T>();
    data
      .map((item) => {
        const id = (item as any).id || crypto.randomUUID();
        const node = new NaryNode(id, {
          ...item,
        });
        node.parentId = (item as any).parentId || null;
        if (node.parentId === null) {
          if (!tree.root) tree.root = node;
        }
        tree.nodes.set(id, node);
        return node;
      })
      .forEach((node) => {
        const { parentId } = node;
        if (parentId && tree.nodes.has(parentId)) {
          tree.nodes.get(parentId)?.children.push(node);
        } else {
          if (node !== tree.root) {
            tree.nodes.delete(node.id);
          }
        }
      });
    tree.size = tree.nodes.size;
    return tree;
  }
}

export default N_Ary_Tree;
