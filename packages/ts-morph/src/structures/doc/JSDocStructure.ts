import { WriterFunction } from "../../types";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";
import { JSDocTagStructure } from "./JSDocTagStructure";

export interface JSDocStructure extends Structure, JSDocSpecificStructure {
}

export interface JSDocSpecificStructure extends KindedStructure<StructureKind.JSDoc> {
    /**
     * The description of the JS doc.
     * @remarks To force this to be multi-line, add a newline to the front of the string.
     */
    description?: string | WriterFunction;
    /** JS doc tags (ex. `&#64;param value - Some description.`). */
    tags?: OptionalKind<JSDocTagStructure>[];
}
