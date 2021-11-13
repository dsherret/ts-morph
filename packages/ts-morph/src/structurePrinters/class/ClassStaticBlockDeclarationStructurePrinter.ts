import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { ClassStaticBlockDeclarationStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class ClassStaticBlockDeclarationStructurePrinter extends NodePrinter<OptionalKind<ClassStaticBlockDeclarationStructure>> {
  constructor(factory: StructurePrinterFactory) {
    super(factory);
  }

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ClassStaticBlockDeclarationStructure>> | undefined) {
    if (structures == null)
      return;

    for (let i = 0; i < structures.length; i++) {
      if (i > 0)
        writer.blankLine();
      this.printText(writer, structures[i]);
    }
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ClassStaticBlockDeclarationStructure>) {
    writer.write("static");
    writer.space().inlineBlock(() => {
      this.factory.forStatementedNode({ isAmbient: false }).printText(writer, structure);
    });
  }
}
