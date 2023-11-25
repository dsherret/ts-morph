import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { OptionalKind, SetAccessorDeclarationStructure } from "../../structures";
import { BlankLineFormattingStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class SetAccessorDeclarationStructurePrinter extends NodePrinter<OptionalKind<SetAccessorDeclarationStructure>> {
    readonly #options: { isAmbient: boolean };
  readonly #multipleWriter = new BlankLineFormattingStructuresPrinter(this);

  constructor(factory: StructurePrinterFactory, options: { isAmbient: boolean }) {
    super(factory);
      this.#options = options;
  }

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>> | undefined) {
    this.#multipleWriter.printText(writer, structures);
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<SetAccessorDeclarationStructure>) {
    this.factory.forJSDoc().printDocs(writer, structure.docs);
    this.factory.forDecorator().printTexts(writer, structure.decorators);

    this.factory.forModifierableNode().printText(writer, structure);
    writer.write(`set ${structure.name}`);
    this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
    this.factory.forParameterDeclaration().printTextsWithParenthesis(writer, structure.parameters);
    this.factory.forReturnTypedNode().printText(writer, structure);

    if (this.#options.isAmbient || structure.isAbstract)
      writer.write(";");
    else {
      writer.spaceIfLastNot().inlineBlock(() => {
        this.factory.forStatementedNode(this.#options).printText(writer, structure);
      });
    }
  }
}
