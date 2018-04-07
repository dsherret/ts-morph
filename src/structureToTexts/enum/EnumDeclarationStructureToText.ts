import {EnumDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {BlankLineFormattingStructuresToText} from "../formatting";

export class EnumDeclarationStructureToText extends StructureToText<EnumDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresToText(this.writer, this);

    writeTexts(structures: EnumDeclarationStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        this.blankLineFormattingWriter.writeText(structures);
    }

    writeText(structure: EnumDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.conditionalWrite(structure.isConst, "const ");
        this.writer.write(`enum ${structure.name}`).block();
    }
}
