import type PlatformRouterTemplate from "@platform-types/interfaces/platform-router.interface";
import type {
  RouteState,
  RouteUpdateType,
  RouterEvents,
} from "@platform-types/interfaces/platform-router.interface";
import Emitter from "@platform-structs/emitter.struct";
abstract class PlatformRouter<X extends Record<string, any> = {}>
  implements PlatformRouterTemplate
{
  protected emitter: Emitter<RouterEvents & Omit<X, keyof RouterEvents>> =
    new Emitter<RouterEvents & Omit<X, keyof RouterEvents>>();
  constructor() {
    window.addEventListener("popstate", this.onPOP.bind(this));
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
    payload: RouterEvents[K]
  ) {
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

  protected replace(url: string, state: RouteState | null): void {
    window?.history?.replaceState(state, "", url);
    const routeState = state ?? ({} as RouteState);
    this.emitState(routeState, "REPLACE");
  }
  protected push(url: string, state: RouteState | null): void {
    window?.history?.pushState(state, "", url);
    const routeState = state ?? ({} as RouteState);
    this.emitState(routeState, "PUSH");
  }
}

export default PlatformRouter;
