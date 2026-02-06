import { CloudConsoleSchema } from "@schema";
import { ConsoleSchema } from "@tesseract/schema";
import { type Static } from "@sinclair/typebox";

type TenantStateMap = Static<typeof CloudConsoleSchema.TenantStateMapSchema>;
type NavItem = Static<typeof ConsoleSchema.NavItemSchema>;
const Store: Partial<TenantStateMap> = {
  "cloud-console": {
    get infra() {
      // TypeScript now knows '_infra' exists on 'this'
      return this._infra || ([] as NavItem[]);
    },
    set infra(v: NavItem[]) {
      this._infra = v;
    },
  },
};

export default Store;
