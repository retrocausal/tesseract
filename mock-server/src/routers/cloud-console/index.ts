import { Router } from "express";
import NavRouter from "./nav.routes";

const ConsoleRouter = Router();
ConsoleRouter.use("/infrastructure", NavRouter);

export default ConsoleRouter;
