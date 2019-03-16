import { CodeBlockWriter } from "../../../codeBlockWriter";
import { PropertyAssignmentStructure, OptionalKind } from "../../../structures";
import { printTextFromStringOrWriter } from "../../../utils";
import { FactoryStructurePrinter } from "../../FactoryStructurePrinter";

export class PropertyAssignmentStructurePrinter extends FactoryStructurePrinter<OptionalKind<PropertyAssignmentStructure>> {
    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<PropertyAssignmentStructure>) {
        writer.write(`${structure.name}: `);
        printTextFromStringOrWriter(writer, structure.initializer);
    }
}
