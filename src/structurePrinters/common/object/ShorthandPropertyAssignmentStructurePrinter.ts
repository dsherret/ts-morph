import {ShorthandPropertyAssignmentStructure} from "../../../structures";
import {StructurePrinter} from "../../StructurePrinter";

export class ShorthandPropertyAssignmentStructurePrinter extends StructurePrinter<ShorthandPropertyAssignmentStructure> {
    printText(structure: ShorthandPropertyAssignmentStructure) {
        this.writer.write(`${structure.name}`);
    }
}
