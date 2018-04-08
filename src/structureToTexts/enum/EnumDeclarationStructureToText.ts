import {EnumDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {JSDocStructureToText} from "../doc";
import {BlankLineFormattingStructuresToText} from "../formatting";
import {EnumMemberStructureToText} from "./EnumMemberStructureToText";

export class EnumDeclarationStructureToText extends StructureToText<EnumDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresToText(this.writer, this);
    private readonly enumMemberWriter = new EnumMemberStructureToText(this.writer);

    writeTexts(structures: EnumDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.writeText(structures);
    }

    writeText(structure: EnumDeclarationStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.modifierWriter.writeText(structure);
        this.writer.conditionalWrite(structure.isConst, "const ");
        this.writer.write(`enum ${structure.name} `).inlineBlock(() => {
            this.enumMemberWriter.writeTexts(structure.members);
        });
    }
}
