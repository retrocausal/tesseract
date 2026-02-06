import { Router } from "express";
import Store from "@/cache";
const NavRouter = Router();
NavRouter.get("/", (_req, _res, next) => {
  const infra = Store["cloud-console"]?.infra || [];
  return _res.json(infra);
});

export default NavRouter;
