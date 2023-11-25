import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { StatementedNodeStructure } from "../../structures";
import { Printer } from "../Printer";

export class StatementedNodeStructurePrinter extends Printer<StatementedNodeStructure> {
    readonly #options: { isAmbient: boolean };
    readonly #factory: StructurePrinterFactory;

  constructor(factory: StructurePrinterFactory, options: { isAmbient: boolean }) {
    super();
      this.#factory = factory;
      this.#options = options;
  }

  printText(writer: CodeBlockWriter, structure: StatementedNodeStructure) {
    this.#factory.forStatement(this.#options).printTexts(writer, structure.statements);
  }
}
