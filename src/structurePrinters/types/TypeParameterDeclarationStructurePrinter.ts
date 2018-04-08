import {TypeParameterDeclarationStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {CommaSeparatedStructuresPrinter} from "../formatting";

export class TypeParameterDeclarationStructurePrinter extends StructurePrinter<TypeParameterDeclarationStructure> {
    private readonly commaSeparatedWriter = new CommaSeparatedStructuresPrinter(this.writer, this);

    printTexts(structures: TypeParameterDeclarationStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;
        this.writer.write("<");
        this.commaSeparatedWriter.printText(structures);
        this.writer.write(">");
    }

    printText(structure: TypeParameterDeclarationStructure) {
        this.writer.write(structure.name);
        if (structure.constraint != null && structure.constraint.length > 0)
            this.writer.write(` extends ${structure.constraint}`);
    }
}
