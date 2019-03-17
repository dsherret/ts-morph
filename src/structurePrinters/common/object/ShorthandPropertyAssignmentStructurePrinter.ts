import { CodeBlockWriter } from "../../../codeBlockWriter";
import { ShorthandPropertyAssignmentStructure, OptionalKind } from "../../../structures";
import { NodePrinter } from "../../NodePrinter";

export class ShorthandPropertyAssignmentStructurePrinter extends NodePrinter<OptionalKind<ShorthandPropertyAssignmentStructure>> {
    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ShorthandPropertyAssignmentStructure>) {
        writer.write(`${structure.name}`);
    }
}
