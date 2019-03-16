import { CodeBlockWriter } from "../../../codeBlockWriter";
import { SpreadAssignmentStructure, OptionalKind } from "../../../structures";
import { printTextFromStringOrWriter } from "../../../utils";
import { FactoryStructurePrinter } from "../../FactoryStructurePrinter";

export class SpreadAssignmentStructurePrinter extends FactoryStructurePrinter<OptionalKind<SpreadAssignmentStructure>> {
    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<SpreadAssignmentStructure>) {
        writer.write("...");
        printTextFromStringOrWriter(writer, structure.expression);
    }
}
