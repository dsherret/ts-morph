import {EnumDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";
import {ModifierableNodeStructureToText} from "./../base";

export class EnumDeclarationStructureToText extends StructureToText<EnumDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeText(structure: EnumDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.conditionalWrite(structure.isConst, "const ");
        this.writer.write(`enum ${structure.name}`).block();
    }
}
