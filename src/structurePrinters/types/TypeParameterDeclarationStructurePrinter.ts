import { CodeBlockWriter } from "../../codeBlockWriter";
import { TypeParameterDeclarationStructure } from "../../structures";
import { StringUtils } from "../../utils";
import { NodePrinter } from "../NodePrinter";
import { CommaSeparatedStructuresPrinter } from "../formatting";

export class TypeParameterDeclarationStructurePrinter extends NodePrinter<TypeParameterDeclarationStructure | string> {
    private readonly multipleWriter = new CommaSeparatedStructuresPrinter(this);

    printTextsWithBrackets(writer: CodeBlockWriter, structures: ReadonlyArray<TypeParameterDeclarationStructure | string> | undefined) {
        if (structures == null || structures.length === 0)
            return;
        writer.write("<");
        this.printTexts(writer, structures);
        writer.write(">");
    }

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<TypeParameterDeclarationStructure | string> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: TypeParameterDeclarationStructure | string) {
        if (typeof structure === "string") {
            writer.write(structure);
            return;
        }

        writer.write(structure.name);
        if (structure.constraint != null) {
            const constraintText = this.getTextWithQueuedChildIndentation(writer, structure.constraint);
            if (!StringUtils.isNullOrWhitespace(constraintText))
                writer.write(` extends ${constraintText}`);
        }
        if (structure.default != null) {
            const defaultText = this.getTextWithQueuedChildIndentation(writer, structure.default);
            if (!StringUtils.isNullOrWhitespace(defaultText))
                writer.write(` = ${defaultText}`);
        }
    }
}
