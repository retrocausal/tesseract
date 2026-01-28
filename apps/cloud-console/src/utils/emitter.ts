import Emitter from "@platform/structures/emitter.struct";
import { CloudConsole } from "@schema";

const CloudConsoleBus = new Emitter<CloudConsole.EmitterEventMap>();

export default CloudConsoleBus;
