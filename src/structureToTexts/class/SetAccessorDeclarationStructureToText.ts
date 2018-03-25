import {SetAccessorDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";

export class SetAccessorDeclarationStructureToText extends StructureToText<SetAccessorDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeText(structure: SetAccessorDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`set ${structure.name}()`);
        this.writer.conditionalWrite(structure.returnType != null && structure.returnType.length > 0, `: ${structure.returnType}`);
        this.writer.spaceIfLastNotSpace().inlineBlock();
    }
}
