import PubSubProvider from "@platform-types/abstracts/emitter.abstract";
import type {
  Listener,
  Subscription,
} from "@platform-types/interfaces/emitter.interface";

class Emitter<T extends Record<string, any>> extends PubSubProvider<T> {
  public emit<K extends keyof T>(name: K, payload: T[K]) {
    if (this.subscriptions?.has(name)) {
      const subscribers = this.subscriptions.get(name);
      if (subscribers && subscribers.length) {
        subscribers.forEach((listener) => {
          try {
            listener(payload);
          } catch (error) {
            console.error(
              `Error in listener for event '${String(name)}':`,
              error
            );
          }
        });
      }
    }
  }

  private enroll<K extends keyof T>(
    name: K,
    callback: Listener<T[K]>
  ): Subscription {
    if (name && callback && typeof callback === "function") {
      if (!this.subscriptions?.has(name)) {
        this.subscriptions.set(name, new Array());
      }
      const subscribers = this.subscriptions.get(name);
      subscribers?.push(callback as Listener<T[keyof T]>);

      const unsubscribe = () => {
        if (this.subscriptions.has(name)) {
          const subscribers = this.subscriptions.get(name);
          if (subscribers?.length) {
            this.subscriptions.set(
              name,
              subscribers.filter((fn) => fn !== callback)
            );
          }
        }
      };
      return { unsubscribe };
    } else {
      throw new Error(
        "Need a name for the event and a callback function that listens"
      );
    }
  }

  public subscribe<K extends keyof T>(
    name: K,
    callback: Listener<T[K]>
  ): Subscription {
    return this.enroll(name, callback);
  }
  public once<K extends keyof T>(
    name: K,
    callback: Listener<T[K]>
  ): Subscription {
    const oneTmeSubscription = this.enroll(name, (payload: T[K]) => {
      callback(payload);
      oneTmeSubscription.unsubscribe();
    });
    return oneTmeSubscription;
  }
}

export default Emitter;
