import {TypeAliasDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {NewLineFormattingStructuresToText} from "../formatting";

export class TypeAliasDeclarationStructureToText extends StructureToText<TypeAliasDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly newLineFormattingWriter = new NewLineFormattingStructuresToText(this.writer, this);

    writeTexts(structures: TypeAliasDeclarationStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        this.newLineFormattingWriter.writeText(structures);
    }

    writeText(structure: TypeAliasDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`type ${structure.name} = ${structure.type};`);
    }
}
