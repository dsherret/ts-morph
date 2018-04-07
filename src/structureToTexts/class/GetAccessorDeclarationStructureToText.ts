import {GetAccessorDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";

export class GetAccessorDeclarationStructureToText extends StructureToText<GetAccessorDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeTexts(structures: GetAccessorDeclarationStructure[]) {
        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                this.writer.blankLine();
            this.writeText(structures[i]);
        }
    }

    writeText(structure: GetAccessorDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`get ${structure.name}()`);
        this.writer.conditionalWrite(structure.returnType != null && structure.returnType.length > 0, `: ${structure.returnType}`);
        this.writer.spaceIfLastNot().inlineBlock();
    }
}
