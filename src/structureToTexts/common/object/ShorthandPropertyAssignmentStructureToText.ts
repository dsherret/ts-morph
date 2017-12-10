import {ShorthandPropertyAssignmentStructure} from "./../../../structures";
import {StructureToText} from "./../../StructureToText";

export class ShorthandPropertyAssignmentStructureToText extends StructureToText<ShorthandPropertyAssignmentStructure> {
    writeText(structure: ShorthandPropertyAssignmentStructure) {
        this.writer.write(`${structure.name}`);
    }
}
