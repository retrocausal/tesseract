import type PlatformRouterTemplate from "@platform-types/interfaces/platform-router.interface";
import type {
  RouteState,
  RouteUpdateType,
  RouterEvents,
} from "@platform-types/interfaces/platform-router.interface";
import Emitter from "@platform-structs/emitter.struct";
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
    // 1. Validation: Ensure we aren't getting absolute URLs
    if (path.startsWith("http")) {
      throw new Error("PlatformRouter: accepts only relative paths.");
    }

    // 2. Normalization: Ensure leading slash for safety
    const fragment = path.startsWith("/") ? path : `/${path}`;

    // 3. Construction
    return `${this.PLATFORM_ROOT}${fragment}`;
  }

  protected replace(url: string, state: RouteState | null): void {
    try {
      window?.history?.replaceState(state, "", this.sanitize(url));
      const routeState = state ?? ({} as RouteState);
      this.emitState(routeState, "REPLACE");
    } catch (error) {
      console.error(error);
    }
  }
  protected push(url: string, state: RouteState | null): void {
    try {
      window?.history?.pushState(state, "", this.sanitize(url));
      const routeState = state ?? ({} as RouteState);
      this.emitState(routeState, "PUSH");
    } catch (error) {
      console.error(error);
    }
  }
}

export default PlatformRouter;
