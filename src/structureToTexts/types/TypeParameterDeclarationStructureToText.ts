import {TypeParameterDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {CommaSeparatedStructuresToText} from "../formatting";

export class TypeParameterDeclarationStructureToText extends StructureToText<TypeParameterDeclarationStructure> {
    private readonly commaSeparatedWriter = new CommaSeparatedStructuresToText(this.writer, this);

    writeTexts(structures: TypeParameterDeclarationStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;
        this.writer.write("<");
        this.commaSeparatedWriter.writeText(structures);
        this.writer.write(">");
    }

    writeText(structure: TypeParameterDeclarationStructure) {
        this.writer.write(structure.name);
        if (structure.constraint != null && structure.constraint.length > 0)
            this.writer.write(` extends ${structure.constraint}`);
    }
}
