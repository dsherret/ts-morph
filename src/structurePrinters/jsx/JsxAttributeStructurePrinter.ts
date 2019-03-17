import * as errors from "../../errors";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { JsxAttributeStructure } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class JsxAttributeStructurePrinter extends NodePrinter<JsxAttributeStructure> {
    protected printTextInternal(writer: CodeBlockWriter, structure: JsxAttributeStructure) {
        errors.throwIfTrue(structure.isSpreadAttribute, "Should not be a spread attribute when writing an attribute.");
        writer.write(structure.name);
        if (structure.initializer != null)
            writer.write("=").write(structure.initializer);
    }
}
