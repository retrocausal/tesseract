import { Router } from "express";
import Store from "@/cache";
import { bootstrapInfra } from "@/bootstrappers/cloud-console";
const NavRouter = Router();
NavRouter.post("/", (req, res, next) => {
  const infra = Store["cloud-console"]?.infra || [];
  if (infra.length < 1) {
    bootstrapInfra(req?.app?.get("httpServer"))
      .then((fetchedInfra) => {
        if (!fetchedInfra) {
          // The fetch failed (and was caught inside bootstrapInfra)
          // We manually pass a new error to the global handler
          throw new Error("Infrastructure data could not be retrieved");
        }
        return res.json(fetchedInfra);
      })
      .catch((e) => next(e));
  } else return res.json(infra);
});

export default NavRouter;
