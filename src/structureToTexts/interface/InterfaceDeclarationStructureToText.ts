import {InterfaceDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {BlankLineFormattingStructuresToText} from "../formatting";

export class InterfaceDeclarationStructureToText extends StructureToText<InterfaceDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresToText(this.writer, this);

    writeTexts(structures: InterfaceDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.writeText(structures);
    }

    writeText(structure: InterfaceDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`interface ${structure.name} `).block();
    }
}
