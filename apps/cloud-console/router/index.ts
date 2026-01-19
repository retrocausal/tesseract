import PlatformRouter from "@platform/types/abstracts/platform-router.abstract";
import type {
  AppRouteEvents,
  StaticResolverMap,
  AppRouterStatic,
  Resolver,
  GREPPEDINFO,
} from "@cloud-types/router.types";
import type { RouterEvents } from "@platform/types/interfaces/platform-router.interface";
import type { Listener } from "@platform/types/interfaces/emitter.interface";
import CLOUD_CONSOLE_ROUTE_CONSTANTS from "@cloud-constants/router.const";
import type { RouteIdentifier } from "@cloud-types/router.types";

function StaticImplements<I>() {
  return (_constructor: I) => {};
}

@StaticImplements<AppRouterStatic>()
class AppRouter extends PlatformRouter<AppRouteEvents> {
  private URI_CHANGE_SUBSCRIBERS: StaticResolverMap = new Map();

  protected onRouteChange(payload: RouterEvents[keyof RouterEvents]): void {
    const path = this.path;
    const splitter = CLOUD_CONSOLE_ROUTE_CONSTANTS.APP_BASE;
    const relativePath = path?.split(splitter as string)?.pop();
    const { query, type, state } = payload;
    const { URI_CHANGE_SUBSCRIBERS } = this;
    const routeCaptures: GREPPEDINFO[] = new Array();
    const { routes } = CLOUD_CONSOLE_ROUTE_CONSTANTS;

    Object.keys(routes).forEach((key) => {
      const id = key as keyof typeof routes;
      const { captureExpression: expression } = routes[id];
      const matches = relativePath?.match(expression);
      if (matches) {
        const value = matches[1];
        if (value) {
          routeCaptures.push({ key: id, value });
        }
        if (URI_CHANGE_SUBSCRIBERS.has(id)) {
          const listeners = URI_CHANGE_SUBSCRIBERS.get(id);
          listeners?.forEach((fn) => fn?.(value));
        }
      }
    });

    this.emitter.emit("cloud:route:update", {
      query,
      state: state || {},
      type,
      path,
      relativePath,
      routeCaptures,
    });
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

  navigate(key: RouteIdentifier, id: string, replace: boolean = false) {
    const { routes, APP_BASE } = CLOUD_CONSOLE_ROUTE_CONSTANTS;
    const op = replace ? "replace" : "push";
    if (routes[key] && id) {
      const definition = routes[key];
      const { route } = definition;
      const path = route(id);
      super[op]?.(`/${APP_BASE}${path}`, {});
    }
  }
}

export default new AppRouter();
