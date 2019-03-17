import { StructurePrinterFactory } from "../factories";
import { CodeBlockWriter } from "../codeBlockWriter";
import { Structure } from "../structures";
import { Printer } from "./Printer";

/** Printer for node structures. */
export abstract class NodePrinter<TStructure> extends Printer<TStructure> {
    constructor(protected readonly factory: StructurePrinterFactory) {
        super();
    }

    printText(writer: CodeBlockWriter, structure: TStructure) {
        const typedStructure: { leadingTrivia: Structure["leadingTrivia"], trailingTrivia: Structure["trailingTrivia"] } = structure as any;
        const leadingTrivia = typedStructure && typedStructure.leadingTrivia;
        const trailingTrivia = typedStructure && typedStructure.trailingTrivia;

        if (leadingTrivia != null) {
            printTrivia.call(this, leadingTrivia);

            if (writer.isInComment())
                writer.closeComment();
        }

        this.printTextInternal(writer, structure);

        if (trailingTrivia != null)
            printTrivia.call(this, trailingTrivia);

        function printTrivia(this: NodePrinter<TStructure>, trivia: Structure["leadingTrivia"]) {
            if (trivia instanceof Array) {
                for (let i = 0; i < trivia.length; i++) {
                    this.printTextOrWriterFunc(writer, trivia[i]);
                    if (i !== trivia.length - 1)
                        writer.newLineIfLastNot();
                }
            }
            else {
                this.printTextOrWriterFunc(writer, trivia);
            }
        }
    }

    protected abstract printTextInternal(writer: CodeBlockWriter, structure: TStructure): void;
}
