import {EnumDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class EnumDeclarationStructureToText extends StructureToText<EnumDeclarationStructure> {
    writeText(structure: EnumDeclarationStructure) {
        this.writer.write(`${structure.isConst ? "const " : ""}enum ${structure.name}`).block();
    }
}
