import { StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { TypeParameterDeclarationStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { CommaSeparatedStructuresPrinter } from "../formatting";

export class TypeParameterDeclarationStructurePrinter extends NodePrinter<OptionalKind<TypeParameterDeclarationStructure> | string> {
    private readonly multipleWriter = new CommaSeparatedStructuresPrinter(this);

    printTextsWithBrackets(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<TypeParameterDeclarationStructure> | string> | undefined) {
        if (structures == null || structures.length === 0)
            return;
        writer.write("<");
        this.printTexts(writer, structures);
        writer.write(">");
    }

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<TypeParameterDeclarationStructure> | string> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<TypeParameterDeclarationStructure> | string) {
        if (typeof structure === "string") {
            writer.write(structure);
            return;
        }

        writer.hangingIndent(() => {
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
