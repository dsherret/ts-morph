import { WriterFunction } from "../../types";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface JSDocStructure extends Structure, JSDocSpecificStructure {
}

export interface JSDocSpecificStructure extends KindedStructure<StructureKind.JSDoc> {
    /**
     * The description of the JS doc.
     * @remarks To force this to be multi-line, add a newline to the front of the string.
     */
    description: string | WriterFunction;
}
