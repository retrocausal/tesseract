import PlatformRouter from "@platform/types/abstracts/platform-router.abstract";
import type {
  AppRouteEvents,
  StaticResolverMap,
  AppRouterStatic,
  Resolver,
} from "@cloud-types/router.types";
import type { RouterEvents } from "@platform/types/interfaces/platform-router.interface";
import type { Listener } from "@platform/types/interfaces/emitter.interface";
import CLOUD_CONSOLE_ROUTE_CONSTANTS, {
  type RouteIdentifier,
} from "@cloud-constants/router.const";

function StaticImplements<I>() {
  return (_constructor: I) => {};
}

@StaticImplements<AppRouterStatic>()
class AppRouter extends PlatformRouter<AppRouteEvents> {
  private URI_CHANGE_SUBSCRIBERS: StaticResolverMap = new Map();

  registerURIChangeListeners(fn: Resolver, key: RouteIdentifier) {
    if (!this.URI_CHANGE_SUBSCRIBERS.has(key)) {
      this.URI_CHANGE_SUBSCRIBERS.set(key, []);
    }
    this.URI_CHANGE_SUBSCRIBERS.get(key)?.push(fn);
  }

  protected onRouteChange(payload: RouterEvents[keyof RouterEvents]): void {
    const path = this.path;
    const splitter = CLOUD_CONSOLE_ROUTE_CONSTANTS.APP_BASE;
    const relativePath = path?.split(splitter as string)?.pop();
    const { query, type, state } = payload;
    const { URI_CHANGE_SUBSCRIBERS } = this;
    for (const [key, listeners] of URI_CHANGE_SUBSCRIBERS) {
      const { Identifiers } = CLOUD_CONSOLE_ROUTE_CONSTANTS;
      if (Identifiers[key]) {
        const expression = Identifiers[key];
        const matches = relativePath?.match(expression);
        if (matches) {
          const value = matches[1];
          if (value) listeners.forEach((fn) => fn?.(value));
        }
      }
    }
    this.emitter.emit("cloud:route:update", {
      query,
      state: state || {},
      type,
      path,
      relativePath,
    });
  }

  public sync(): void {
    super.sync();
  }

  public subscribe<K extends keyof AppRouteEvents>(
    name: K,
    callback: Listener<AppRouteEvents[K]>,
  ) {
    return this.emitter.subscribe(name, callback);
  }
}

export default new AppRouter();
