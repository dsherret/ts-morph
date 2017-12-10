import {PropertyAssignmentStructure} from "./../../../structures";
import {StructureToText} from "./../../StructureToText";

export class PropertyAssignmentStructureToText extends StructureToText<PropertyAssignmentStructure> {
    writeText(structure: PropertyAssignmentStructure) {
        this.writer.write(`${structure.name}: ${structure.initializer}`);
    }
}
