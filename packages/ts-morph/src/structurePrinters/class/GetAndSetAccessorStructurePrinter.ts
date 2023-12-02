import { CodeBlockWriter } from "../../codeBlockWriter";
import { GetAccessorDeclarationStructure, OptionalKind, SetAccessorDeclarationStructure } from "../../structures";
import { GetAccessorDeclarationStructurePrinter } from "./GetAccessorDeclarationStructurePrinter";
import { SetAccessorDeclarationStructurePrinter } from "./SetAccessorDeclarationStructurePrinter";

export class GetAndSetAccessorStructurePrinter {
  #getAccessorPrinter: GetAccessorDeclarationStructurePrinter;
  #setAccessorPrinter: SetAccessorDeclarationStructurePrinter;

  constructor(getAccessorPrinter: GetAccessorDeclarationStructurePrinter, setAccessorPrinter: SetAccessorDeclarationStructurePrinter) {
    this.#getAccessorPrinter = getAccessorPrinter;
    this.#setAccessorPrinter = setAccessorPrinter;
  }

  printGetAndSet(
    writer: CodeBlockWriter,
    getAccessors: OptionalKind<GetAccessorDeclarationStructure>[] | undefined,
    setAccessors: OptionalKind<SetAccessorDeclarationStructure>[] | undefined,
    isAmbient: boolean,
  ) {
    getAccessors = [...getAccessors ?? []];
    setAccessors = [...setAccessors ?? []];

    for (const getAccessor of getAccessors) {
      this.#conditionalSeparator(writer, isAmbient);
      this.#getAccessorPrinter.printText(writer, getAccessor);

      // write the corresponding set accessor beside the get accessor
      const setAccessorIndex = setAccessors.findIndex(item => item.name === getAccessor.name);
      if (setAccessorIndex >= 0) {
        this.#conditionalSeparator(writer, isAmbient);
        this.#setAccessorPrinter.printText(writer, setAccessors[setAccessorIndex]);
        setAccessors.splice(setAccessorIndex, 1);
      }
    }

    for (const setAccessor of setAccessors) {
      this.#conditionalSeparator(writer, isAmbient);
      this.#setAccessorPrinter.printText(writer, setAccessor);
    }
  }

  #conditionalSeparator(writer: CodeBlockWriter, isAmbient: boolean) {
    if (writer.isAtStartOfFirstLineOfBlock())
      return;

    if (isAmbient)
      writer.newLine();
    else
      writer.blankLine();
  }
}
