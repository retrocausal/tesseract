import type CustomEventEmitter from "@platform-types/interfaces/emitter.interface";
import type {
  Listeners,
  Listener,
  Subscription,
} from "@platform-types/interfaces/emitter.interface";

abstract class PubSubProvider<T extends Record<string, any>>
  implements CustomEventEmitter<T>
{
  protected subscriptions: Map<keyof T, Listeners<T[keyof T]>> = new Map();
  public abstract emit<K extends keyof T>(name: K, payload: T[K]): void;
  public abstract subscribe<K extends keyof T>(
    name: K,
    callback: Listener<T[K]>
  ): Subscription;
  public abstract once<K extends keyof T>(
    name: K,
    callback: Listener<T[K]>
  ): Subscription;
}

export default PubSubProvider;
