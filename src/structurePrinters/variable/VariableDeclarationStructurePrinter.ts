import { CodeBlockWriter } from "../../codeBlockWriter";
import { VariableDeclarationStructure } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { CommaSeparatedStructuresPrinter } from "../formatting";

export class VariableDeclarationStructurePrinter extends NodePrinter<VariableDeclarationStructure> {
    private readonly multipleWriter = new CommaSeparatedStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<VariableDeclarationStructure>) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: VariableDeclarationStructure) {
        writer.write(structure.name);
        writer.conditionalWrite(structure.hasExclamationToken, "!");
        this.factory.forTypedNode(":").printText(writer, structure);
        this.factory.forInitializerExpressionableNode().printText(writer, structure);
    }
}
