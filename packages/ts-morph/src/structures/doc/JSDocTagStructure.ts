import { WriterFunction } from "../../types";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface JSDocTagStructure extends Structure, JSDocTagSpecificStructure {
}

export interface JSDocTagSpecificStructure extends KindedStructure<StructureKind.JSDocTag> {
    /** The name for the JS doc tag that comes after the "at" symbol. */
    tagName: string;
    /** The text that follows the tag name. */
    text?: string | WriterFunction;
}
