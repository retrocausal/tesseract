import Emitter from "@common-struct/emitter";
import { EmitterEventMap } from "@cloud/types/emitter.types";

const eventEmitter = new Emitter<EmitterEventMap>();

export default eventEmitter;
