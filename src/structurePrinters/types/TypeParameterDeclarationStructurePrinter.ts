import CodeBlockWriter from "code-block-writer";
import {TypeParameterDeclarationStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {CommaSeparatedStructuresPrinter} from "../formatting";

export class TypeParameterDeclarationStructurePrinter extends StructurePrinter<TypeParameterDeclarationStructure> {
    private readonly commaSeparatedWriter = new CommaSeparatedStructuresPrinter(this);

    printTextsWithBrackets(writer: CodeBlockWriter, structures: TypeParameterDeclarationStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;
        writer.write("<");
        this.printTexts(writer, structures);
        writer.write(">");
    }

    printTexts(writer: CodeBlockWriter, structures: TypeParameterDeclarationStructure[] | undefined) {
        this.commaSeparatedWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: TypeParameterDeclarationStructure) {
        writer.write(structure.name);
        if (structure.constraint != null && structure.constraint.length > 0)
            writer.write(` extends ${structure.constraint}`);
    }
}
