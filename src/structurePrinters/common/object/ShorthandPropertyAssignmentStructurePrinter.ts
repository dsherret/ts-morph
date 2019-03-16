import { CodeBlockWriter } from "../../../codeBlockWriter";
import { ShorthandPropertyAssignmentStructure, OptionalKind } from "../../../structures";
import { FactoryStructurePrinter } from "../../FactoryStructurePrinter";

export class ShorthandPropertyAssignmentStructurePrinter extends FactoryStructurePrinter<OptionalKind<ShorthandPropertyAssignmentStructure>> {
    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ShorthandPropertyAssignmentStructure>) {
        writer.write(`${structure.name}`);
    }
}
