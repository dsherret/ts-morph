import {PropertyAssignmentStructure} from "../../../structures";
import {StructurePrinter} from "../../StructurePrinter";

export class PropertyAssignmentStructurePrinter extends StructurePrinter<PropertyAssignmentStructure> {
    printText(structure: PropertyAssignmentStructure) {
        this.writer.write(`${structure.name}: ${structure.initializer}`);
    }
}
