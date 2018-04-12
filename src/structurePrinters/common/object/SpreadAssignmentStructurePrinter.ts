import CodeBlockWriter from "code-block-writer";
import {SpreadAssignmentStructure} from "../../../structures";
import {StructurePrinter} from "../../StructurePrinter";

export class SpreadAssignmentStructurePrinter extends StructurePrinter<SpreadAssignmentStructure> {
    printText(writer: CodeBlockWriter, structure: SpreadAssignmentStructure) {
        writer.write(`...${structure.expression}`);
    }
}
