import {TypeParameterDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";

export class TypeParameterDeclarationStructureToText extends StructureToText<TypeParameterDeclarationStructure> {
    writeText(structure: TypeParameterDeclarationStructure) {
        this.writer.write(structure.name);
        if (structure.constraint != null && structure.constraint.length > 0)
            this.writer.write(` extends ${structure.constraint}`);
    }
}
