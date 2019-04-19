import { CodeBlockWriter } from "../../codeBlockWriter";
import { VariableDeclarationStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { CommaSeparatedStructuresPrinter } from "../formatting";

export class VariableDeclarationStructurePrinter extends NodePrinter<OptionalKind<VariableDeclarationStructure>> {
    private readonly multipleWriter = new CommaSeparatedStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<VariableDeclarationStructure>>) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<VariableDeclarationStructure>) {
        writer.write(structure.name);
        writer.conditionalWrite(structure.hasExclamationToken, "!");
        this.factory.forTypedNode(":").printText(writer, structure);
        this.factory.forInitializerExpressionableNode().printText(writer, structure);
    }
}
