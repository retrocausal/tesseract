import PlatformRouter from "@platform/types/abstracts/platform-router.abstract";
import type { AppRouteEvents } from "@cloud-router/types";
import type { RouterEvents } from "@platform/types/interfaces/platform-router.interface";
import type { Listener } from "@platform/types/interfaces/emitter.interface";

class AppRouter extends PlatformRouter<AppRouteEvents> {
  static APP_BASE = "cloud-console";
  public onRouteChange(payload: RouterEvents[keyof RouterEvents]): void {
    const path = this.path;
    const relativePath = path?.split(AppRouter.APP_BASE)?.pop();
    const { query, type, state } = payload;
    this,
      this.emitter.emit("cloud:route:update", {
        query,
        state: state || {},
        type,
        path,
        relativePath,
      });
  }
  public subscribe<K extends keyof AppRouteEvents>(
    name: K,
    callback: Listener<AppRouteEvents[K]>
  ) {
    return this.emitter.subscribe(name, callback);
  }
}

export default AppRouter;
