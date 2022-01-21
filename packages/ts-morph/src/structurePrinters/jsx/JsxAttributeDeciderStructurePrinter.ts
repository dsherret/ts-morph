import { errors } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { JsxAttributeStructure, JsxElementStructure, JsxSpreadAttributeStructure, OptionalKind, StructureKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class JsxAttributeDeciderStructurePrinter extends NodePrinter<InferArrayElementType<JsxElementStructure["attributes"]>> {
  protected printTextInternal(writer: CodeBlockWriter, structure: InferArrayElementType<JsxElementStructure["attributes"]>) {
    if (isJsxAttribute(structure))
      this.factory.forJsxAttribute().printTextWithoutTrivia(writer, structure);
    else if (structure.kind === StructureKind.JsxSpreadAttribute)
      this.factory.forJsxSpreadAttribute().printTextWithoutTrivia(writer, structure);
    else
      throw errors.throwNotImplementedForNeverValueError(structure);

    // need to help out the typescript compiler with this function for some reason
    function isJsxAttribute(struct: InferArrayElementType<JsxElementStructure["attributes"]>): struct is OptionalKind<JsxAttributeStructure> {
      return structure.kind == null || structure.kind === StructureKind.JsxAttribute;
    }
  }
}
