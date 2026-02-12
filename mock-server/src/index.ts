import express, { type ErrorRequestHandler } from "express";
import ConsoleRouter from "@/routers/cloud-console";
import BootStrappers from "@/bootstrappers";

// Catch synchronous errors
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Catch asynchronous (Promise) errors
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(reason);
  process.exit(1);
});

const app = express();
const env = process.env;

app.use("/cloud", ConsoleRouter);

const globalExceptionHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof Error && !res.headersSent) {
    console.error(err);
    res.status(500).end();
  } else next(err);
};

app.use(globalExceptionHandler);

const server = app.listen(env.port || 18000, () => {
  console.log(`listening on ${env.port || 18000}`);
  Object.keys(BootStrappers).forEach((key) => {
    const appBootStrappers = BootStrappers[key];
    appBootStrappers.forEach((fn) => fn(server));
  });
});
server.on("upgrade", (req) => {
  console.log("Socket upgrade request path:", req.url);
});
app.set("httpServer", server);
