import {EnumMemberStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class EnumMemberStructureToText extends StructureToText<EnumMemberStructure> {
    writeText(structure: EnumMemberStructure) {
        this.writer.write(structure.name);
        if (typeof structure.value === "string")
            this.writer.write(` = `).quote(structure.value);
        else if (typeof structure.value === "number")
            this.writer.write(` = ${structure.value}`)
    }
}
