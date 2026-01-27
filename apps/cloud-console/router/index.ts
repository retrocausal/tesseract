import PlatformRouter from "@platform/types/abstracts/platform-router.abstract";
import {
  type AppRouteEvents,
  type Resolvers,
  type Resolver,
  type GreppedInfo,
} from "@cloud-types/router.types";
import type { RouterEvents } from "@platform/types/interfaces/platform-router.interface";
import type { Listener } from "@platform/types/interfaces/emitter.interface";
import CLOUD_CONSOLE_ROUTE_CONSTANTS, {
  CLOUD_CONSOLE_ROUTES,
} from "@cloud-constants/router.const";
import type { NavMap, RouteIdentifier } from "@cloud-types/router.types";

class AppRouter extends PlatformRouter<AppRouteEvents> {
  private URI_CHANGE_SUBSCRIBERS: Resolvers = new Map();

  protected onRouteChange(payload: RouterEvents[keyof RouterEvents]): void {
    const path = this.path;
    const splitter = CLOUD_CONSOLE_ROUTE_CONSTANTS.APP_BASE;
    const relativePath = path?.split(splitter as string)?.pop();
    const { query, type, state } = payload;
    const routeCaptures: GreppedInfo[] = new Array();

    Object.keys(CLOUD_CONSOLE_ROUTES).forEach((key) => {
      const id = key as RouteIdentifier;
      const expression = CLOUD_CONSOLE_ROUTES[id].captureExpression;
      const matches = relativePath?.match(expression);
      if (matches) {
        const value = matches[1];

        if (value) {
          routeCaptures.push({ key: id, value });
        }
        if (this.URI_CHANGE_SUBSCRIBERS.has(id)) {
          const listeners = this.URI_CHANGE_SUBSCRIBERS.get(id);
          listeners?.forEach((fn) => fn?.(value));
        }
      }
    });
    const eventPayload = {
      query,
      state: state || {},
      type,
      path,
      relativePath,
      routeCaptures,
    };
    this.emitter.emit("cloud:route:update", eventPayload);
  }

  sync(): void {
    super.sync();
  }

  subscribe<K extends keyof AppRouteEvents>(
    name: K,
    callback: Listener<AppRouteEvents[K]>,
  ) {
    return this.emitter.subscribe(name, callback);
  }
  registerURIChangeListeners(fn: Resolver, key: RouteIdentifier) {
    if (!this.URI_CHANGE_SUBSCRIBERS.has(key)) {
      this.URI_CHANGE_SUBSCRIBERS.set(key, []);
    }
    this.URI_CHANGE_SUBSCRIBERS.get(key)?.push(fn);
  }

  navigate(as: RouteIdentifier, identifiers: NavMap, replace: boolean = false) {
    const { APP_BASE } = CLOUD_CONSOLE_ROUTE_CONSTANTS;
    const op = replace ? "replace" : "push";

    try {
      let path = CLOUD_CONSOLE_ROUTES[as]?.route(identifiers);
      super[op]?.(`/${APP_BASE}${path}`, {});
    } catch (error) {}
  }
}

export default new AppRouter();
