import Emitter from "@common-struct/emitter.struct";
import { EmitterEventMap } from "@cloud/types/emitter.types";

const CloudConsoleBus = new Emitter<EmitterEventMap>();

export default CloudConsoleBus;
