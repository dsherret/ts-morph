import CodeBlockWriter from "code-block-writer";
import {StructureToText} from "../StructureToText";

export class CommaSeparatedStructuresToText<T> extends StructureToText<T[]> {
    constructor(writer: CodeBlockWriter, private readonly structureToText: StructureToText<T>) {
        super(writer);
    }

    writeText(structures: T[] | undefined) {
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                this.writer.write(", ");
            this.structureToText.writeText(structures[i]);
        }
    }
}
