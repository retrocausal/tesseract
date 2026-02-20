import Emitter from "@tesseract/platform/structures/emitter.struct";
import { EmitterEventMap } from "@cloud-types/emitter.ui.types";

const CloudConsoleBus = new Emitter<EmitterEventMap>();

export default CloudConsoleBus;
