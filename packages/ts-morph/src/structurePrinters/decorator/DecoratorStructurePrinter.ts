import { CodeBlockWriter } from "../../codeBlockWriter";
import { DecoratorStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class DecoratorStructurePrinter extends NodePrinter<OptionalKind<DecoratorStructure>> {
    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<DecoratorStructure>> | undefined) {
        this.printMultiple(writer, structures, () => writer.newLine());
    }

    printTextsInline(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<DecoratorStructure>> | undefined) {
        this.printMultiple(writer, structures, () => writer.space());
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<DecoratorStructure>) {
        writer.write(`@${structure.name}`);
        this.printTypeArguments(writer, structure);
        this.printArguments(writer, structure);
    }

    private printTypeArguments(writer: CodeBlockWriter, structure: OptionalKind<DecoratorStructure>) {
        if (structure.typeArguments == null || structure.typeArguments.length === 0)
            return;

        writer.write("<");
        for (let i = 0; i < structure.typeArguments.length; i++) {
            writer.conditionalWrite(i > 0, ", ");
            writer.write(this.getTextWithQueuedChildIndentation(writer, structure.typeArguments[i]));
        }
        writer.write(">");
    }

    private printArguments(writer: CodeBlockWriter, structure: OptionalKind<DecoratorStructure>) {
        if (structure.arguments == null)
            return;

        writer.write("(");

        const args = structure.arguments instanceof Array ? structure.arguments : [structure.arguments];

        for (let i = 0; i < args.length; i++) {
            writer.conditionalWrite(i > 0, ", ");
            writer.write(this.getTextWithQueuedChildIndentation(writer, args[i]));
        }

        writer.write(")");
    }

    private printMultiple(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<DecoratorStructure>> | undefined, separator: () => void) {
        if (structures == null || structures.length === 0)
            return;
        for (const structure of structures) {
            this.printText(writer, structure);
            separator();
        }
    }
}
