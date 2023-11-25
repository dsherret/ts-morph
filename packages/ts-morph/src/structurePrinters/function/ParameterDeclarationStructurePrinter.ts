import { errors } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { OptionalKind, ParameterDeclarationStructure } from "../../structures";
import { CommaSeparatedStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class ParameterDeclarationStructurePrinter extends NodePrinter<OptionalKind<ParameterDeclarationStructure>> {
  readonly #multipleWriter = new CommaSeparatedStructuresPrinter(this);

  printTextsWithParenthesis(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ParameterDeclarationStructure>> | undefined) {
    writer.write("(");
    if (structures != null)
      this.factory.forParameterDeclaration().printTexts(writer, structures);
    writer.write(`)`);
  }

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ParameterDeclarationStructure>> | undefined) {
    if (structures == null || structures.length === 0)
      return;
    writer.hangingIndent(() => {
      this.#multipleWriter.printText(writer, structures);
    });
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ParameterDeclarationStructure>) {
    if (structure.name == null) {
      throw new errors
        .NotImplementedError(
        "Not implemented scenario where parameter declaration structure doesn't have a name. Please open an issue if you need this.",
      );
    }

    this.factory.forDecorator().printTextsInline(writer, structure.decorators);
    this.factory.forModifierableNode().printText(writer, structure);
    writer.conditionalWrite(structure.isRestParameter, "...");
    writer.write(structure.name);
    writer.conditionalWrite(structure.hasQuestionToken, "?");
    this.factory.forTypedNode(":", structure.hasQuestionToken).printText(writer, structure);
    this.factory.forInitializerExpressionableNode().printText(writer, structure);
  }
}
