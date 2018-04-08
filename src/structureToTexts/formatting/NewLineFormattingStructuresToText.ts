import CodeBlockWriter from "code-block-writer";
import {StructureToText} from "../StructureToText";

export class NewLineFormattingStructuresToText<T> extends StructureToText<T[]> {
    constructor(writer: CodeBlockWriter, private readonly structureToText: StructureToText<T>) {
        super(writer);
    }

    writeText(structures: T[] | undefined) {
        if (structures == null)
            return;
        for (let i = 0; i < structures.length; i++) {
            this.writer.conditionalNewLine(i > 0);
            this.structureToText.writeText(structures[i]);
        }
    }
}
