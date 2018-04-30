import { WriterFunction } from "../../../types";
import { PropertyNamedNodeStructure } from "../../base";

export interface PropertyAssignmentStructure extends PropertyNamedNodeStructure {
    initializer: string | WriterFunction;
}
