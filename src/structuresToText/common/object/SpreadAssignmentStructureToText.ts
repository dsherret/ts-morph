import {SpreadAssignmentStructure} from "./../../../structures";
import {StructureToText} from "./../../StructureToText";

export class SpreadAssignmentStructureToText extends StructureToText<SpreadAssignmentStructure> {
    writeText(structure: SpreadAssignmentStructure) {
        this.writer.write(`...${structure.expression}`);
    }
}
