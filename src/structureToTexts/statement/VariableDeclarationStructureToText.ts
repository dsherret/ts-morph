import {VariableDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";

export class VariableDeclarationStructureToText extends StructureToText<VariableDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeText(structure: VariableDeclarationStructure) {
        this.writer.write(structure.name);
        if (structure.type != null)
            this.writer.write(": " + structure.type);
        if (structure.initializer != null)
            this.writer.write(" = " + structure.initializer);
    }
}
