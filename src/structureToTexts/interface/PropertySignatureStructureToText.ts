import {StringUtils} from "../../utils";
import {PropertySignatureStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {JSDocStructureToText} from "../doc";

export class PropertySignatureStructureToText extends StructureToText<PropertySignatureStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly modifierableWriter = new ModifierableNodeStructureToText(this.writer);

    writeTexts(structures: PropertySignatureStructure[]) {
        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                this.writer.newLine();
            this.writeText(structures[i]);
        }
    }

    writeText(structure: PropertySignatureStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.modifierableWriter.writeText(structure);
        this.writer.write(structure.name);
        this.writer.conditionalWrite(structure.hasQuestionToken, "?");
        if (!StringUtils.isNullOrWhitespace(structure.type))
            this.writer.write(`: ${structure.type}`);
        if (!StringUtils.isNullOrWhitespace(structure.initializer))
            this.writer.write(` = ${structure.initializer}`); // why would someone write an initializer?
        this.writer.write(";");
    }
}
