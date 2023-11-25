import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { GetAccessorDeclarationStructure, OptionalKind } from "../../structures";
import { BlankLineFormattingStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class GetAccessorDeclarationStructurePrinter extends NodePrinter<OptionalKind<GetAccessorDeclarationStructure>> {
  readonly #options: { isAmbient: boolean };
  readonly #blankLineWriter = new BlankLineFormattingStructuresPrinter(this);

  constructor(factory: StructurePrinterFactory, options: { isAmbient: boolean }) {
    super(factory);
    this.#options = options;
  }

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>> | undefined) {
    this.#blankLineWriter.printText(writer, structures);
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<GetAccessorDeclarationStructure>) {
    this.factory.forJSDoc().printDocs(writer, structure.docs);
    this.factory.forDecorator().printTexts(writer, structure.decorators);
    this.factory.forModifierableNode().printText(writer, structure);
    writer.write(`get ${structure.name}`);
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
