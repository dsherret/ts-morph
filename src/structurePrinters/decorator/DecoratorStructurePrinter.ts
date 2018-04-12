import CodeBlockWriter from "code-block-writer";
import {DecoratorStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";

export class DecoratorStructurePrinter extends StructurePrinter<DecoratorStructure> {
    printTexts(writer: CodeBlockWriter, structures: DecoratorStructure[] | undefined) {
        this.printMultiple(writer, structures, () => writer.newLine());
    }

    printTextsInline(writer: CodeBlockWriter, structures: DecoratorStructure[] | undefined) {
        this.printMultiple(writer, structures, () => writer.space());
    }

    printText(writer: CodeBlockWriter, structure: DecoratorStructure) {
        writer.write(`@${structure.name}`);
        if (structure.arguments != null)
            writer.write(`(${structure.arguments.join(", ")})`);
    }

    private printMultiple(writer: CodeBlockWriter, structures: DecoratorStructure[] | undefined, separator: () => void) {
        if (structures == null || structures.length === 0)
            return;
        for (const structure of structures) {
            this.printText(writer, structure);
            separator();
        }
    }
}
