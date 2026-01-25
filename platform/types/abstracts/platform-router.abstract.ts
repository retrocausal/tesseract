import type PlatformRouterTemplate from "@platform-types/interfaces/platform-router.interface";
import type {
  RouteState,
  RouteUpdateType,
  RouterEvents,
} from "@platform-types/interfaces/platform-router.interface";
import Emitter from "@platform-structs/emitter.struct";

// 1. Import the Schema and the Validator
import { SerializableSchema } from "@platform-types/interfaces/serializable.interface";
import { Value } from "@sinclair/typebox/value";

abstract class PlatformRouter<
  X extends Record<string, any> = {},
> implements PlatformRouterTemplate {
  protected emitter: Emitter<RouterEvents & Omit<X, keyof RouterEvents>> =
    new Emitter<RouterEvents & Omit<X, keyof RouterEvents>>();
  private readonly PLATFORM_ROOT = "/apps";

  protected abstract onRouteChange(
    payload: RouterEvents[keyof RouterEvents],
  ): void;

  constructor() {
    window.addEventListener("popstate", this.onPOP.bind(this));
  }
  protected sync(): void {
    this.emitState({ ...(window?.history?.state || {}) }, "POP");
  }

  private onPOP(e: unknown) {
    if (e instanceof PopStateEvent) {
      const routeState = { ...(e.state || {}) } as RouteState;
      this.emitState(routeState, "POP");
    }
  }

  get queryParams() {
    const url = new URL(window?.location?.href);
    return {
      value: url?.searchParams,
      toString: function () {
        const query = this.value?.toString();
        if (query) {
          return `?${query}`;
        }
      },
    };
  }

  get path() {
    const url = new URL(window?.location?.href);
    const pathName = url?.pathname;
    return pathName;
  }

  get pathFragments() {
    const pathName = this.path;
    return (pathName || "").split("/").filter((v) => !!v);
  }

  private emit<K extends keyof RouterEvents>(
    name: K,
    payload: RouterEvents[K],
  ) {
    this.onRouteChange?.(payload);
    (this.emitter as any).emit(name, payload);
  }

  private emitState(state: RouteState, type: RouteUpdateType) {
    this.emit("route:change", {
      type,
      state,
      query: this.queryParams,
      pathFragments: this.pathFragments,
    });
  }

  private sanitize(path: string) {
    if (path.startsWith("http")) {
      throw new Error("PlatformRouter: accepts only relative paths.");
    }
    const fragment = path.startsWith("/") ? path : `/${path}`;
    return `${this.PLATFORM_ROOT}${fragment}`;
  }

  // -----------------------------------------------------------------------
  // RUNTIME VALIDATION
  // -----------------------------------------------------------------------

  protected replace(url: string, state: RouteState | null): void {
    try {
      // 2. Validate before calling Browser API
      if (state && !Value.Check(SerializableSchema, state)) {
        console.error("Router Fault: Invalid State", [
          ...Value.Errors(SerializableSchema, state),
        ]);
        throw new Error(
          `${[...Value.Errors(SerializableSchema, state)]?.join(",")}`,
        );
      }

      window?.history?.replaceState(state, "", this.sanitize(url));
      const routeState = state ?? ({} as RouteState);
      this.emitState(routeState, "REPLACE");
    } catch (error) {
      console.error(error);
    }
  }

  protected push(url: string, state: RouteState | null): void {
    try {
      // 3. Validate before calling Browser API
      if (state && !Value.Check(SerializableSchema, state)) {
        console.error("Router Fault: Invalid State", [
          ...Value.Errors(SerializableSchema, state),
        ]);
        throw new Error(
          `${[...Value.Errors(SerializableSchema, state)]?.join(",")}`,
        );
      }

      window?.history?.pushState(state, "", this.sanitize(url));
      const routeState = state ?? ({} as RouteState);
      this.emitState(routeState, "PUSH");
    } catch (error) {
      console.error(error);
    }
  }
}

export default PlatformRouter;
