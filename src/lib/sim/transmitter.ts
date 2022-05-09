import Entity from "./entity";
import { TransmitterType } from "./transmitter-type";

export default interface Transmitter extends Entity {
  transmitterType: TransmitterType;
}
