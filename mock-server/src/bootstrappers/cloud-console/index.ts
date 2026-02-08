import { fetchInfrastructureNav } from "@/helpers/cloud-console/infra";
import { openSocket } from "@/helpers/cloud-console/chaos";
import { Server } from "node:http";
import Store from "@/cache";

export function bootstrapInfra(server: Server) {
  return fetchInfrastructureNav()
    .then((infra) => {
      //save infra
      if (Store["cloud-console"]) Store["cloud-console"].infra = infra;
      //open socket
      const httpServer: Server | undefined = server;
      if (httpServer) {
        openSocket(httpServer, infra);
      }
      return infra;
    })
    .catch((e) => {
      console.error(e);
    });
}

export default [bootstrapInfra];
