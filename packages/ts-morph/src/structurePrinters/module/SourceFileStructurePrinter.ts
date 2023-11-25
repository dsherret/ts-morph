import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { OptionalKind, SourceFileStructure } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class SourceFileStructurePrinter extends NodePrinter<OptionalKind<SourceFileStructure>> {
    readonly #options: { isAmbient: boolean };

  constructor(factory: StructurePrinterFactory, options: { isAmbient: boolean }) {
    super(factory);
      this.#options = options;
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<SourceFileStructure>) {
    this.factory.forStatementedNode(this.#options).printText(writer, structure);

    writer.conditionalNewLine(!writer.isAtStartOfFirstLineOfBlock() && !writer.isLastNewLine());
  }
}
