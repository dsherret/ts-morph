import { WriterFunction } from "../../types";
import { Structure } from "../Structure";

export interface JSDocStructure extends Structure, JSDocSpecificStructure {
}

export interface JSDocSpecificStructure {
    description: string | WriterFunction;
}
