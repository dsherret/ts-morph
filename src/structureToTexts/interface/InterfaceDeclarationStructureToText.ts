import {InterfaceDeclarationStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {JSDocStructureToText} from "../doc";
import {BlankLineFormattingStructuresToText} from "../formatting";
import {TypeParameterDeclarationStructureToText} from "../types";
import {TypeElementMemberedNodeStructureToText} from "./TypeElementMemberedNodeStructureToText";

export class InterfaceDeclarationStructureToText extends StructureToText<InterfaceDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresToText(this.writer, this);
    private readonly typeParameterWriter = new TypeParameterDeclarationStructureToText(this.writer);
    private readonly typeElementMembersWriter = new TypeElementMemberedNodeStructureToText(this.writer);

    writeTexts(structures: InterfaceDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.writeText(structures);
    }

    writeText(structure: InterfaceDeclarationStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.modifierWriter.writeText(structure);
        this.writer.write(`interface ${structure.name}`);
        this.typeParameterWriter.writeTexts(structure.typeParameters);
        this.writer.space();
        if (!ArrayUtils.isNullOrEmpty(structure.extends))
            this.writer.write(`extends ${structure.extends.join(", ")} `);
        this.writer.inlineBlock(() => {
            this.typeElementMembersWriter.writeText(structure);
        });
    }
}
