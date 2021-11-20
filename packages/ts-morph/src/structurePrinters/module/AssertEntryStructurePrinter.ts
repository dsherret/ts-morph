import { CodeBlockWriter } from "../../codeBlockWriter";
import { AssertEntryStructure, OptionalKind } from "../../structures";
import { CommaNewLineSeparatedStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class AssertEntryStructurePrinter extends NodePrinter<OptionalKind<AssertEntryStructure>> {
  private readonly multipleWriter = new CommaNewLineSeparatedStructuresPrinter(this);

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<AssertEntryStructure>> | undefined) {
    this.multipleWriter.printText(writer, structures);
  }

  printAssertClause(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<AssertEntryStructure>> | undefined) {
    if (!structures)
      return;

    writer.write("assert ");
    writer.inlineBlock(() => {
      this.printTexts(writer, structures);
    });
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<AssertEntryStructure>) {
    writer.write(structure.name);
    writer.write(": ");
    writer.quote(structure.value);
  }
}
