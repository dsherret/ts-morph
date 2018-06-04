import { CodeBlockWriter } from "../../codeBlockWriter";
import { DecoratorStructure } from "../../structures";
import { printTextFromStringOrWriter } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class DecoratorStructurePrinter extends FactoryStructurePrinter<DecoratorStructure> {
    printTexts(writer: CodeBlockWriter, structures: DecoratorStructure[] | undefined) {
        this.printMultiple(writer, structures, () => writer.newLine());
    }

    printTextsInline(writer: CodeBlockWriter, structures: DecoratorStructure[] | undefined) {
        this.printMultiple(writer, structures, () => writer.space());
    }

    printText(writer: CodeBlockWriter, structure: DecoratorStructure) {
        writer.write(`@${structure.name}`);
        this.printArguments(writer, structure);
    }

    printArguments(writer: CodeBlockWriter, structure: DecoratorStructure) {
        if (structure.arguments == null)
            return;

        writer.write("(");
        for (let i = 0; i < structure.arguments.length; i++) {
            writer.conditionalWrite(i > 0, ", ");
            printTextFromStringOrWriter(writer, structure.arguments[i]);
        }
        writer.write(")");
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
