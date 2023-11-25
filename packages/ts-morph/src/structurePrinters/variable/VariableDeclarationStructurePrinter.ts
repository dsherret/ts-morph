import { CodeBlockWriter } from "../../codeBlockWriter";
import { OptionalKind, VariableDeclarationStructure } from "../../structures";
import { CommaSeparatedStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class VariableDeclarationStructurePrinter extends NodePrinter<OptionalKind<VariableDeclarationStructure>> {
  readonly #multipleWriter = new CommaSeparatedStructuresPrinter(this);

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<VariableDeclarationStructure>>) {
    this.#multipleWriter.printText(writer, structures);
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<VariableDeclarationStructure>) {
    writer.write(structure.name);
    writer.conditionalWrite(structure.hasExclamationToken, "!");
    this.factory.forTypedNode(":").printText(writer, structure);
    this.factory.forInitializerExpressionableNode().printText(writer, structure);
  }
}
