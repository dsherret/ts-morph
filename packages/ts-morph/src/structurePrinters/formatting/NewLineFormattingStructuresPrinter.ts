import { CodeBlockWriter } from "../../codeBlockWriter";
import { Printer } from "../Printer";

export class NewLineFormattingStructuresPrinter<T> extends Printer<ReadonlyArray<T>> {
    readonly #printer: Printer<T>;

  constructor(printer: Printer<T>) {
    super();
      this.#printer = printer;
  }

  printText(writer: CodeBlockWriter, structures: ReadonlyArray<T> | undefined) {
    if (structures == null)
      return;

    for (let i = 0; i < structures.length; i++) {
      writer.conditionalNewLine(i > 0);
      this.#printer.printText(writer, structures[i]);
    }
  }
}
