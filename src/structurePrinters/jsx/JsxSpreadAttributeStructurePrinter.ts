import * as errors from "../../errors";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { JsxSpreadAttributeStructure } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class JsxSpreadAttributeStructurePrinter extends NodePrinter<JsxSpreadAttributeStructure> {
    protected printTextInternal(writer: CodeBlockWriter, structure: JsxSpreadAttributeStructure) {
        errors.throwIfTrue(!structure.isSpreadAttribute, "Should be a spread attribute when writing one.");
        writer.write("...");
        writer.write(structure.expression);
    }
}
