import CodeBlockWriter from "code-block-writer";
import {StructureToText} from "../StructureToText";

export class CommaNewLineSeparatedStructuresToText<T> extends StructureToText<T[]> {
    constructor(writer: CodeBlockWriter, private readonly structureToText: StructureToText<T>) {
        super(writer);
    }

    writeText(structures: T[]) {
        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                this.writer.write(",").newLine();
            this.structureToText.writeText(structures[i]);
        }
    }
}
