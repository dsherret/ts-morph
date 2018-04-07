import {PropertySignatureStructure} from "../../structures";
import {StructureToText} from "../StructureToText";

export class PropertySignatureStructureToText extends StructureToText<PropertySignatureStructure> {
    writeTexts(structures: PropertySignatureStructure[]) {
        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                this.writer.newLine();
            this.writeText(structures[i]);
        }
    }

    writeText(structure: PropertySignatureStructure) {
        this.writer.write(structure.name);
        this.writer.conditionalWrite(structure.hasQuestionToken, "?");
        if (structure.type != null && structure.type.length > 0)
            this.writer.write(`: ${structure.type}`);
        this.writer.write(";");
    }
}
