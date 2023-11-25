import { StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { TypeParameterVariance } from "../../compiler";
import { OptionalKind, TypeParameterDeclarationStructure } from "../../structures";
import { CommaSeparatedStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class TypeParameterDeclarationStructurePrinter extends NodePrinter<OptionalKind<TypeParameterDeclarationStructure> | string> {
  readonly #multipleWriter = new CommaSeparatedStructuresPrinter(this);

  printTextsWithBrackets(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<TypeParameterDeclarationStructure> | string> | undefined) {
    if (structures == null || structures.length === 0)
      return;
    writer.write("<");
    this.printTexts(writer, structures);
    writer.write(">");
  }

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<TypeParameterDeclarationStructure> | string> | undefined) {
    this.#multipleWriter.printText(writer, structures);
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<TypeParameterDeclarationStructure> | string) {
    if (typeof structure === "string") {
      writer.write(structure);
      return;
    }

    writer.hangingIndent(() => {
      if (structure.isConst)
        writer.write("const ");
      if (structure.variance != null) {
        if ((structure.variance & TypeParameterVariance.In) !== 0)
          writer.write("in ");
        if ((structure.variance & TypeParameterVariance.Out) !== 0)
          writer.write("out ");
      }
      writer.write(structure.name);
      if (structure.constraint != null) {
        const constraintText = this.getText(writer, structure.constraint);
        if (!StringUtils.isNullOrWhitespace(constraintText))
          writer.write(` extends ${constraintText}`);
      }
      if (structure.default != null) {
        const defaultText = this.getText(writer, structure.default);
        if (!StringUtils.isNullOrWhitespace(defaultText))
          writer.write(` = ${defaultText}`);
      }
    });
  }
}
