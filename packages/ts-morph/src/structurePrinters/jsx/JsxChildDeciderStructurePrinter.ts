import { CodeBlockWriter } from "../../codeBlockWriter";
import { errors } from "@ts-morph/common";
import { JsxElementStructure, StructureKind, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class JsxChildDeciderStructurePrinter extends NodePrinter<InferArrayElementType<JsxElementStructure["children"]>> {
    protected printTextInternal(writer: CodeBlockWriter, structure: InferArrayElementType<JsxElementStructure["children"]>) {
        if (isJsxElement(structure))
            this.factory.forJsxElement().printText(writer, structure);
        else if (structure.kind === StructureKind.JsxSelfClosingElement)
            this.factory.forJsxSelfClosingElement().printText(writer, structure);
        else
            errors.throwNotImplementedForNeverValueError(structure);

        // need to help out the typescript compiler with this function for some reason
        function isJsxElement(struct: InferArrayElementType<JsxElementStructure["children"]>): struct is OptionalKind<JsxElementStructure> {
            return struct.kind == null || struct.kind === StructureKind.JsxElement;
        }
    }
}
