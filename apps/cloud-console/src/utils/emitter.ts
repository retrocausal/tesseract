import Emitter from "@tesseract/platform/structures/emitter.struct";
import { CloudConsole } from "@tesseract/schema";

const CloudConsoleBus = new Emitter<CloudConsole.EmitterEventMap>();

export default CloudConsoleBus;
