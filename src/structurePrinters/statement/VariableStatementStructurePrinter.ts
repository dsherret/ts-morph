import { CodeBlockWriter } from "../../codeBlockWriter";
import { VariableDeclarationKind } from "../../compiler/variable/VariableDeclarationKind";
import { VariableStatementStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class VariableStatementStructurePrinter extends FactoryStructurePrinter<VariableStatementStructure> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: VariableStatementStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: VariableStatementStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(`${structure.declarationKind || VariableDeclarationKind.Let} `);
        this.factory.forVariableDeclaration().printTexts(writer, structure.declarations);
        writer.write(";");
    }
}
