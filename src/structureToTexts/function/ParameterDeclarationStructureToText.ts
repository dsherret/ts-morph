import {ParameterDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";

export class ParameterDeclarationStructureToText extends StructureToText<ParameterDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeText(structure: ParameterDeclarationStructure) {
        this.modifierWriter.writeText(structure);
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
