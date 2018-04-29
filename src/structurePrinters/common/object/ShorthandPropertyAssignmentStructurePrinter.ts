import { CodeBlockWriter } from "../../../codeBlockWriter";
import { ShorthandPropertyAssignmentStructure } from "../../../structures";
import { FactoryStructurePrinter } from "../../FactoryStructurePrinter";

export class ShorthandPropertyAssignmentStructurePrinter extends FactoryStructurePrinter<ShorthandPropertyAssignmentStructure> {
    printText(writer: CodeBlockWriter, structure: ShorthandPropertyAssignmentStructure) {
        writer.write(`${structure.name}`);
    }
}
