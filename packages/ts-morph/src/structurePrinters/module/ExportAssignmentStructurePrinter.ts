import { CodeBlockWriter } from "../../codeBlockWriter";
import { ExportAssignmentStructure, OptionalKind } from "../../structures";
import { NewLineFormattingStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class ExportAssignmentStructurePrinter extends NodePrinter<OptionalKind<ExportAssignmentStructure>> {
  private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ExportAssignmentStructure>> | undefined) {
    this.multipleWriter.printText(writer, structures);
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ExportAssignmentStructure>) {
    this.factory.forJSDoc().printDocs(writer, structure.docs);
    writer.write("export");
    if (structure.isExportEquals !== false)
      writer.write(" = ");
    else
      writer.write(" default ");

    writer.write(this.getTextWithQueuedChildIndentation(writer, structure.expression)).write(";");
  }
}
