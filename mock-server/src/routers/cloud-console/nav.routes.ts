import { Router } from "express";
import Store from "@/cache";
import { bootstrapInfra } from "@/bootstrappers/cloud-console";
const NavRouter = Router();
NavRouter.post("/", async (req, res, next) => {
  const infra = Store["cloud-console"]?.infra || [];
  let data = {};
  try {
    if (infra.length < 1) {
      const fetchedInfra = await bootstrapInfra(req?.app?.get("httpServer"));
      if (!fetchedInfra) {
        // The fetch failed (and was caught inside bootstrapInfra)
        // We manually pass a new error to the global handler
        throw new Error("Infrastructure data could not be retrieved");
      }
      data = { infra: fetchedInfra };
    } else {
      data = { infra };
    }
    return res.json(data);
  } catch (e) {
    console.warn(e);
    next(e);
  }
});

export default NavRouter;
