import { StructurePrinterFactory } from "../factories";
import { CodeBlockWriter } from "../codeBlockWriter";
import { Structure } from "../structures";
import { Printer } from "./Printer";

/** Printer for node structures. */
export abstract class NodePrinter<TStructure> extends Printer<TStructure> {
    constructor(protected readonly factory: StructurePrinterFactory) {
        super();
    }

    printTextWithoutTrivia(writer: CodeBlockWriter, structure: TStructure) {
        this.printTextInternal(writer, structure);
    }

    printText(writer: CodeBlockWriter, structure: TStructure) {
        this.printLeadingTrivia(writer, structure);
        writer.closeComment();
        this.printTextInternal(writer, structure);
        this.printTrailingTrivia(writer, structure);
    }

    protected abstract printTextInternal(writer: CodeBlockWriter, structure: TStructure): void;

    printLeadingTrivia(writer: CodeBlockWriter, structure: TStructure) {
        const leadingTrivia = (structure as any)["leadingTrivia"] as Structure["leadingTrivia"];

        if (leadingTrivia != null) {
            this.printTrivia(writer, leadingTrivia);

            if (writer.isInComment())
                writer.closeComment();
        }
    }

    printTrailingTrivia(writer: CodeBlockWriter, structure: TStructure) {
        const trailingTrivia = (structure as any)["trailingTrivia"] as Structure["trailingTrivia"];

        if (trailingTrivia != null)
            this.printTrivia(writer, trailingTrivia);
    }

    private printTrivia(writer: CodeBlockWriter, trivia: Structure["leadingTrivia"]) {
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
