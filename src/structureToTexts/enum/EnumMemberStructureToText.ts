import {EnumMemberStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class EnumMemberStructureToText extends StructureToText<EnumMemberStructure> {
    writeText(structure: EnumMemberStructure) {
        this.writer.write(structure.name);
        if (typeof structure.value !== "undefined")
            this.writer.write(` = ${structure.value}`);
    }
}
