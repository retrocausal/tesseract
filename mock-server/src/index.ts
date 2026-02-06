import express from "express";
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

const server = app.listen(env.port || 18000, () => {
  console.log(`listening on ${env.port || 18000}`);
  Object.keys(BootStrappers).forEach((key) => {
    const appBootStrappers = BootStrappers[key];
    appBootStrappers.forEach((fn) => fn(server));
  });
});
app.set("httpServer", server);
