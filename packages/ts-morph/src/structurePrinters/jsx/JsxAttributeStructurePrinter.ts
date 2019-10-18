import { CodeBlockWriter } from "../../codeBlockWriter";
import { JsxAttributeStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class JsxAttributeStructurePrinter extends NodePrinter<OptionalKind<JsxAttributeStructure>> {
    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<JsxAttributeStructure>) {
        writer.write(structure.name);
        if (structure.initializer != null)
            writer.write("=").write(structure.initializer);
    }
}
