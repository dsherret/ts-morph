import { CodeBlockWriter } from "../../../codeBlockWriter";
import { OptionalKind, PropertyAssignmentStructure } from "../../../structures";
import { printTextFromStringOrWriter } from "../../../utils";
import { NodePrinter } from "../../NodePrinter";

export class PropertyAssignmentStructurePrinter extends NodePrinter<OptionalKind<PropertyAssignmentStructure>> {
  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<PropertyAssignmentStructure>) {
    writer.hangingIndent(() => {
      this.printTextOrWriterFunc(writer, structure.name);
      writer.write(": ");
      printTextFromStringOrWriter(writer, structure.initializer);
    });
  }
}
