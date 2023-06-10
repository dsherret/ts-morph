import { CodeBlockWriter } from "../../codeBlockWriter";
import { JsxAttributeStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class JsxAttributeStructurePrinter extends NodePrinter<OptionalKind<JsxAttributeStructure>> {
  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<JsxAttributeStructure>) {
    if (typeof structure.name === "object")
      this.factory.forJsxNamespacedName().printText(writer, structure.name);
    else
      writer.write(structure.name);

    if (structure.initializer != null)
      writer.write("=").write(structure.initializer);
  }
}
