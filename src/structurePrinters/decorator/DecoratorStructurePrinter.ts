import CodeBlockWriter from "code-block-writer";
import {DecoratorStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";

export class DecoratorStructurePrinter extends StructurePrinter<DecoratorStructure> {
    printTexts(structures: DecoratorStructure[] | undefined) {
        this.printMultiple(structures, writer => writer.newLine());
    }

    printTextsInline(structures: DecoratorStructure[] | undefined) {
        this.printMultiple(structures, writer => writer.space());
    }

    printText(structure: DecoratorStructure) {
        this.writer.write(`@${structure.name}`);
        if (structure.arguments != null)
            this.writer.write(`(${structure.arguments.join(", ")})`);
    }

    private printMultiple(structures: DecoratorStructure[] | undefined, separator: (writer: CodeBlockWriter) => void) {
        if (structures == null || structures.length === 0)
            return;
        for (const structure of structures) {
            this.printText(structure);
            separator(this.writer);
        }
    }
}
