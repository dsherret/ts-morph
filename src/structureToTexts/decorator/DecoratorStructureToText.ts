import CodeBlockWriter from "code-block-writer";
import {DecoratorStructure} from "../../structures";
import {StructureToText} from "../StructureToText";

export class DecoratorStructureToText extends StructureToText<DecoratorStructure> {
    writeTexts(structures: DecoratorStructure[] | undefined) {
        this.writeMultiple(structures, writer => writer.newLine());
    }

    writeTextsInline(structures: DecoratorStructure[] | undefined) {
        this.writeMultiple(structures, writer => writer.space());
    }

    writeText(structure: DecoratorStructure) {
        this.writer.write(`@${structure.name}`);
        if (structure.arguments != null)
            this.writer.write(`(${structure.arguments.join(", ")})`);
    }

    private writeMultiple(structures: DecoratorStructure[] | undefined, separator: (writer: CodeBlockWriter) => void) {
        if (structures == null || structures.length === 0)
            return;
        for (const structure of structures) {
            this.writeText(structure);
            separator(this.writer);
        }
    }
}
