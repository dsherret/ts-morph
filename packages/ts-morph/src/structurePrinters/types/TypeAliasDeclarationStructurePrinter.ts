import { CodeBlockWriter } from "../../codeBlockWriter";
import { OptionalKind, TypeAliasDeclarationStructure } from "../../structures";
import { NewLineFormattingStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class TypeAliasDeclarationStructurePrinter extends NodePrinter<OptionalKind<TypeAliasDeclarationStructure>> {
  private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<TypeAliasDeclarationStructure>> | undefined) {
    this.multipleWriter.printText(writer, structures);
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<TypeAliasDeclarationStructure>) {
    this.factory.forJSDoc().printDocs(writer, structure.docs);
    this.factory.forModifierableNode().printText(writer, structure);
    writer.write(`type ${structure.name}`);
    this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
    this.factory.forTypedNode(" =").printText(writer, structure);
    writer.write(";");
  }
}
