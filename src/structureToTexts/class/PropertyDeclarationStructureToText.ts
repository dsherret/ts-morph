import {PropertyDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class PropertyDeclarationStructureToText extends StructureToText<PropertyDeclarationStructure> {
    writeText(structure: PropertyDeclarationStructure) {
        this.writer.conditionalWrite(structure.isStatic, "static ");
        this.writer.write(structure.name);
        this.writer.conditionalWrite(structure.hasQuestionToken, "?");
        this.writer.conditionalWrite(structure.type != null && structure.type.length > 0, `: ${structure.type}`);
        this.writer.write(";");
    }
}
