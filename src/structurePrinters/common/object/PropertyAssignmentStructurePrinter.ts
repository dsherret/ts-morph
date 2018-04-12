import CodeBlockWriter from "code-block-writer";
import {PropertyAssignmentStructure} from "../../../structures";
import {StructurePrinter} from "../../StructurePrinter";

export class PropertyAssignmentStructurePrinter extends StructurePrinter<PropertyAssignmentStructure> {
    printText(writer: CodeBlockWriter, structure: PropertyAssignmentStructure) {
        writer.write(`${structure.name}: ${structure.initializer}`);
    }
}
