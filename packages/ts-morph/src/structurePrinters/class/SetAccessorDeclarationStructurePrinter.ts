import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { OptionalKind, SetAccessorDeclarationStructure } from "../../structures";
import { BlankLineFormattingStructuresPrinter, NewLineFormattingStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";
import { Printer } from "../Printer";

export class SetAccessorDeclarationStructurePrinter extends NodePrinter<OptionalKind<SetAccessorDeclarationStructure>> {
  readonly #options: { isAmbient: boolean };
  readonly #multipleWriter: Printer<ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>>;

  constructor(factory: StructurePrinterFactory, options: { isAmbient: boolean }) {
    super(factory);
    this.#options = options;
    this.#multipleWriter = this.#options.isAmbient ? new NewLineFormattingStructuresPrinter(this) : new BlankLineFormattingStructuresPrinter(this);
  }

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>> | undefined) {
    if (structures != null)
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
