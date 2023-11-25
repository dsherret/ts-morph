import { StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { InterfaceDeclarationStructure, OptionalKind } from "../../structures";
import { BlankLineFormattingStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class InterfaceDeclarationStructurePrinter extends NodePrinter<OptionalKind<InterfaceDeclarationStructure>> {
  readonly #multipleWriter = new BlankLineFormattingStructuresPrinter(this);

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<InterfaceDeclarationStructure>> | undefined) {
    this.#multipleWriter.printText(writer, structures);
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<InterfaceDeclarationStructure>) {
    this.factory.forJSDoc().printDocs(writer, structure.docs);

    this.factory.forModifierableNode().printText(writer, structure);
    writer.write(`interface ${structure.name}`);
    this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
    writer.space();

    if (structure.extends != null) {
      const extendsText = structure.extends instanceof Array
        ? structure.extends.map(i => this.getText(writer, i)).join(", ")
        : this.getText(writer, structure.extends);

      if (!StringUtils.isNullOrWhitespace(extendsText))
        writer.hangingIndent(() => writer.write(`extends ${extendsText} `));
    }

    writer.inlineBlock(() => {
      this.factory.forTypeElementMemberedNode().printText(writer, structure);
    });
  }
}
