import { CodeBlockWriter } from "../../codeBlockWriter";
import { VariableDeclarationKind } from "../../compiler/ast/variable/VariableDeclarationKind";
import { VariableStatementStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class VariableStatementStructurePrinter extends NodePrinter<OptionalKind<VariableStatementStructure>> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<VariableStatementStructure>> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<VariableStatementStructure>) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);

        writer.hangingIndent(() => {
            this.factory.forModifierableNode().printText(writer, structure);
            writer.write(`${structure.declarationKind || VariableDeclarationKind.Let} `);
            this.factory.forVariableDeclaration().printTexts(writer, structure.declarations);
            writer.write(";");
        });
    }
}
