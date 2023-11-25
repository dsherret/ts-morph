import { errors, nameof, ObjectUtils, StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { ModuleDeclarationKind } from "../../compiler";
import { StructurePrinterFactory } from "../../factories";
import { ModuleDeclarationStructure, OptionalKind } from "../../structures";
import { setValueIfUndefined } from "../../utils";
import { BlankLineFormattingStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class ModuleDeclarationStructurePrinter extends NodePrinter<OptionalKind<ModuleDeclarationStructure>> {
    readonly #options: { isAmbient: boolean };
  readonly #blankLineFormattingWriter = new BlankLineFormattingStructuresPrinter(this);

  constructor(factory: StructurePrinterFactory, options: { isAmbient: boolean }) {
    super(factory);
      this.#options = options;
  }

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ModuleDeclarationStructure>> | undefined) {
    this.#blankLineFormattingWriter.printText(writer, structures);
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ModuleDeclarationStructure>) {
    structure = this.#validateAndGetStructure(structure);

    this.factory.forJSDoc().printDocs(writer, structure.docs);
    this.factory.forModifierableNode().printText(writer, structure);
    if (structure.declarationKind == null || structure.declarationKind !== ModuleDeclarationKind.Global)
      writer.write(`${structure.declarationKind || "namespace"} ${structure.name}`);
    else
      writer.write("global");

    if (
      structure.hasDeclareKeyword && StringUtils.isQuoted(structure.name.trim())
      && structure.hasOwnProperty(nameof(structure, "statements")) && structure.statements == null
    ) {
      writer.write(";");
    } else {
      writer.write(" ");
      writer.inlineBlock(() => {
        this.factory.forStatementedNode({
          isAmbient: structure.hasDeclareKeyword || this.#options.isAmbient,
        }).printText(writer, structure);
      });
    }
  }

  #validateAndGetStructure(structure: OptionalKind<ModuleDeclarationStructure>) {
    if (StringUtils.isQuoted(structure.name.trim())) {
      if (structure.declarationKind === ModuleDeclarationKind.Namespace) {
        throw new errors.InvalidOperationError(
          `Cannot print a namespace with quotes for namespace with name ${structure.name}. `
            + `Use ModuleDeclarationKind.Module instead.`,
        );
      }

      structure = ObjectUtils.clone(structure);
      setValueIfUndefined(structure, "hasDeclareKeyword", true);
      setValueIfUndefined(structure, "declarationKind", ModuleDeclarationKind.Module);
    }

    return structure;
  }
}
