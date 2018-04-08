import {EnumMemberStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {CommaNewLineSeparatedStructuresToText} from "../formatting";

export class EnumMemberStructureToText extends StructureToText<EnumMemberStructure> {
    private readonly multipleWriter = new CommaNewLineSeparatedStructuresToText(this.writer, this);

    writeTexts(structures: EnumMemberStructure[] | undefined) {
        this.multipleWriter.writeText(structures);
    }

    writeText(structure: EnumMemberStructure) {
        this.writer.write(structure.name);
        if (typeof structure.value === "string")
            this.writer.write(` = `).quote(structure.value);
        else if (typeof structure.value === "number")
            this.writer.write(` = ${structure.value}`);
        else if (structure.initializer != null)
            this.writer.write(` = ${structure.initializer}`);
    }
}
