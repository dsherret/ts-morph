import CodeBlockWriter from "code-block-writer";
import {StructureToText} from "../StructureToText";

export class BlankLineFormattingStructuresToText<T> extends StructureToText<T[]> {
    constructor(writer: CodeBlockWriter, private readonly structureToText: StructureToText<T>) {
        super(writer);
    }

    writeText(structures: T[]) {
        for (let i = 0; i < structures.length; i++) {
            this.writer.conditionalBlankLine(i > 0);
            this.structureToText.writeText(structures[i]);
        }
    }
}
