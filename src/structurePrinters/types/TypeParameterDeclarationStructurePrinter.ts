import { CodeBlockWriter } from "../../codeBlockWriter";
import { TypeParameterDeclarationStructure } from "../../structures";
import { StringUtils } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { CommaSeparatedStructuresPrinter } from "../formatting";

export class TypeParameterDeclarationStructurePrinter extends FactoryStructurePrinter<TypeParameterDeclarationStructure> {
    private readonly multipleWriter = new CommaSeparatedStructuresPrinter(this);

    printTextsWithBrackets(writer: CodeBlockWriter, structures: ReadonlyArray<TypeParameterDeclarationStructure> | undefined) {
        if (structures == null || structures.length === 0)
            return;
        writer.write("<");
        this.printTexts(writer, structures);
        writer.write(">");
    }

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<TypeParameterDeclarationStructure> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: TypeParameterDeclarationStructure) {
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
