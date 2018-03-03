import {TypeAliasDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";
import {ModifierableNodeStructureToText} from "./../base";

export class TypeAliasDeclarationStructureToText extends StructureToText<TypeAliasDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeText(structure: TypeAliasDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`type ${structure.name} = ${structure.type};`);
    }
}
