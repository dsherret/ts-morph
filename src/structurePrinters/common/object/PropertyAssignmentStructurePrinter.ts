import CodeBlockWriter from "code-block-writer";
import {PropertyAssignmentStructure} from "../../../structures";
import {FactoryStructurePrinter} from "../../FactoryStructurePrinter";

export class PropertyAssignmentStructurePrinter extends FactoryStructurePrinter<PropertyAssignmentStructure> {
    printText(writer: CodeBlockWriter, structure: PropertyAssignmentStructure) {
        writer.write(`${structure.name}: ${structure.initializer}`);
    }
}
