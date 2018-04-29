import { CodeBlockWriter } from "../../../codeBlockWriter";
import { SpreadAssignmentStructure } from "../../../structures";
import { FactoryStructurePrinter } from "../../FactoryStructurePrinter";

export class SpreadAssignmentStructurePrinter extends FactoryStructurePrinter<SpreadAssignmentStructure> {
    printText(writer: CodeBlockWriter, structure: SpreadAssignmentStructure) {
        writer.write(`...${structure.expression}`);
    }
}
