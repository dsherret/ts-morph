import { CodeBlockWriter } from "../../codeBlockWriter";
import { TypeParameterDeclarationStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { CommaSeparatedStructuresPrinter } from "../formatting";

export class TypeParameterDeclarationStructurePrinter extends FactoryStructurePrinter<TypeParameterDeclarationStructure> {
    private readonly multipleWriter = new CommaSeparatedStructuresPrinter(this);

    printTextsWithBrackets(writer: CodeBlockWriter, structures: TypeParameterDeclarationStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;
        writer.write("<");
        this.printTexts(writer, structures);
        writer.write(">");
    }

    printTexts(writer: CodeBlockWriter, structures: TypeParameterDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: TypeParameterDeclarationStructure) {
        writer.write(structure.name);
        if (structure.constraint != null && structure.constraint.length > 0)
            writer.write(` extends ${structure.constraint}`);
        if (structure.default != null && structure.default.length > 0)
            writer.write(` = ${structure.default}`);
    }
}
