import {StringUtils} from "../../utils";
import {PropertySignatureStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {NewLineFormattingStructuresToText} from "../formatting";
import {JSDocStructureToText} from "../doc";

export class PropertySignatureStructureToText extends StructureToText<PropertySignatureStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly modifierableWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly multipleWriter = new NewLineFormattingStructuresToText(this.writer, this);

    writeTexts(structures: PropertySignatureStructure[] | undefined) {
        this.multipleWriter.writeText(structures);
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
