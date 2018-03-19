import {PropertyDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";

export class PropertyDeclarationStructureToText extends StructureToText<PropertyDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeText(structure: PropertyDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(structure.name);
        this.writer.conditionalWrite(structure.hasQuestionToken, "?");
        this.writer.conditionalWrite(structure.type != null && structure.type.length > 0, `: ${structure.type}`);
        this.writer.write(";");
    }
}
