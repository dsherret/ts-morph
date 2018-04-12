import CodeBlockWriter from "code-block-writer";
import {ShorthandPropertyAssignmentStructure} from "../../../structures";
import {StructurePrinter} from "../../StructurePrinter";

export class ShorthandPropertyAssignmentStructurePrinter extends StructurePrinter<ShorthandPropertyAssignmentStructure> {
    printText(writer: CodeBlockWriter, structure: ShorthandPropertyAssignmentStructure) {
        writer.write(`${structure.name}`);
    }
}
