import { CodeBlockWriter } from "../../codeBlockWriter";
import { errors } from "@ts-morph/common";
import { JsxElementStructure, JsxAttributeStructure, JsxSpreadAttributeStructure, StructureKind, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class JsxAttributeDeciderStructurePrinter extends NodePrinter<InferArrayElementType<JsxElementStructure["attributes"]>> {
    protected printTextInternal(writer: CodeBlockWriter, structure: InferArrayElementType<JsxElementStructure["attributes"]>) {
        if (isJsxAttribute(structure))
            this.factory.forJsxAttribute().printText(writer, structure);
        else if (structure.kind === StructureKind.JsxSpreadAttribute)
            this.factory.forJsxSpreadAttribute().printText(writer, structure);
        else
            throw errors.throwNotImplementedForNeverValueError(structure);

        // need to help out the typescript compiler with this function for some reason
        function isJsxAttribute(struct: InferArrayElementType<JsxElementStructure["attributes"]>): struct is OptionalKind<JsxAttributeStructure> {
            return structure.kind == null || structure.kind === StructureKind.JsxAttribute;
        }
    }
}
