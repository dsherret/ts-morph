import {ConstructorDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";
import {ModifierableNodeStructureToText} from "./../base";

export class ConstructorDeclarationStructureToText extends StructureToText<ConstructorDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeText(structure: ConstructorDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write("constructor()").block();
    }
}
