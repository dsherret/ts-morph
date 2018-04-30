import { CodeBlockWriter } from "../../../codeBlockWriter";
import { PropertyAssignmentStructure } from "../../../structures";
import { printTextFromStringOrWriter } from "../../../utils";
import { FactoryStructurePrinter } from "../../FactoryStructurePrinter";

export class PropertyAssignmentStructurePrinter extends FactoryStructurePrinter<PropertyAssignmentStructure> {
    printText(writer: CodeBlockWriter, structure: PropertyAssignmentStructure) {
        writer.write(`${structure.name}: `);
        printTextFromStringOrWriter(writer, structure.initializer);
    }
}
