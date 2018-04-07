import {NamespaceDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {BlankLineFormattingStructuresToText} from "../formatting";

export class NamespaceDeclarationStructureToText extends StructureToText<NamespaceDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresToText(this.writer, this);

    writeTexts(structures: NamespaceDeclarationStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        this.blankLineFormattingWriter.writeText(structures);
    }

    writeText(structure: NamespaceDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`${structure.hasModuleKeyword ? "module" : "namespace"} ${structure.name}`).block();
    }
}
