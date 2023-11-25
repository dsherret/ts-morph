import { CodeBlockWriter } from "../../codeBlockWriter";
import { ImportAttributeStructure, OptionalKind } from "../../structures";
import { CommaNewLineSeparatedStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class ImportAttributeStructurePrinter extends NodePrinter<OptionalKind<ImportAttributeStructure>> {
  readonly #multipleWriter = new CommaNewLineSeparatedStructuresPrinter(this);

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ImportAttributeStructure>> | undefined) {
    this.#multipleWriter.printText(writer, structures);
  }

  printAttributes(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ImportAttributeStructure>> | undefined) {
    if (!structures)
      return;

    writer.write("with ");
    writer.inlineBlock(() => {
      this.printTexts(writer, structures);
    });
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ImportAttributeStructure>) {
    writer.write(structure.name);
    writer.write(": ");
    writer.quote(structure.value);
  }
}
