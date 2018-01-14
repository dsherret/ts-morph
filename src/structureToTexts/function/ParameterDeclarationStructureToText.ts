import {ParameterDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class ParameterDeclarationStructureToText extends StructureToText<ParameterDeclarationStructure> {
    writeText(structure: ParameterDeclarationStructure) {
        this.writer.conditionalWrite(structure.isRestParameter, "...");
        this.writer.write(structure.name);
        this.writer.conditionalWrite(structure.type != null && structure.type.length > 0, `: ${structure.type}`);
    }

    writeParameters(structures: ParameterDeclarationStructure[] | undefined) {
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            this.writer.conditionalWrite(i > 0, ", ");
            this.writeText(structures[i]);
        }
    }
}
