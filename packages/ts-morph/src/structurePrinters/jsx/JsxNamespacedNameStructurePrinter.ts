import { CodeBlockWriter } from "../../codeBlockWriter";
import { JsxNamespacedNameStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class JsxNamespacedNameStructurePrinter extends NodePrinter<JsxNamespacedNameStructure> {
  protected printTextInternal(writer: CodeBlockWriter, structure: JsxNamespacedNameStructure) {
    writer.write(structure.namespace).write(":").write(structure.name);
  }
}
