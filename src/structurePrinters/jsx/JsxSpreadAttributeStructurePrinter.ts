import * as errors from "../../errors";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { JsxSpreadAttributeStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class JsxSpreadAttributeStructurePrinter extends FactoryStructurePrinter<JsxSpreadAttributeStructure> {
    printText(writer: CodeBlockWriter, structure: JsxSpreadAttributeStructure) {
        errors.throwIfTrue(!structure.isSpreadAttribute, "Should be a spread attribute when writing one.");
        writer.write("...");
        writer.write(structure.expression);
    }
}
