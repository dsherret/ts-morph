import { WriterFunction } from "../../types";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface JSDocStructure extends Structure, JSDocSpecificStructure {
}

export interface JSDocSpecificStructure extends KindedStructure<StructureKind.JSDoc> {
    description: string | WriterFunction;
}
