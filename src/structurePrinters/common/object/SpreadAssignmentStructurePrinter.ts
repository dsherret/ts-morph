import {SpreadAssignmentStructure} from "../../../structures";
import {StructurePrinter} from "../../StructurePrinter";

export class SpreadAssignmentStructurePrinter extends StructurePrinter<SpreadAssignmentStructure> {
    printText(structure: SpreadAssignmentStructure) {
        this.writer.write(`...${structure.expression}`);
    }
}
