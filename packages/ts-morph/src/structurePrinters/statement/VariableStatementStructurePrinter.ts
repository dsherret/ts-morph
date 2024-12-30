import { CodeBlockWriter } from "../../codeBlockWriter";
import { VariableDeclarationKind } from "../../compiler/ast/variable/VariableDeclarationKind";
import { OptionalKind, VariableStatementStructure } from "../../structures";
import { NewLineFormattingStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class VariableStatementStructurePrinter extends NodePrinter<OptionalKind<VariableStatementStructure>> {
  readonly #multipleWriter = new NewLineFormattingStructuresPrinter(this);

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<VariableStatementStructure>> | undefined) {
    this.#multipleWriter.printText(writer, structures);
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<VariableStatementStructure>) {
    this.factory.forJSDoc().printDocs(writer, structure.docs);

    writer.hangingIndent(() => {
      this.factory.forModifierableNode().printText(writer, structure);
      writer.write(`${structure.declarationKind || VariableDeclarationKind.Let} `);
      if (structure.declarations.length === 0)
        throw new Error("You must provide at least one declaration when inserting a variable statement.");
      this.factory.forVariableDeclaration().printTexts(writer, structure.declarations);
      writer.write(";");
    });
  }
}
