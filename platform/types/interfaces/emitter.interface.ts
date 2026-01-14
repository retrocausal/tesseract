export type Subscription = {
  unsubscribe(): void;
};
export type Listener<E> = (arg: E) => void;
export type Listeners<F> = Listener<F>[];

interface CustomEventEmitter<T extends Record<string, any>> {
  subscribe<K extends keyof T>(name: K, callback: Listener<T[K]>): Subscription;
  once<K extends keyof T>(name: K, callback: Listener<T[K]>): Subscription;
  emit<K extends keyof T>(name: K, payload: T[K]): void;
}

export default CustomEventEmitter;
