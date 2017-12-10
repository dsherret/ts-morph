import {SetAccessorDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class SetAccessorDeclarationStructureToText extends StructureToText<SetAccessorDeclarationStructure> {
    writeText(structure: SetAccessorDeclarationStructure) {
        this.writer.conditionalWrite(structure.isStatic, "static ");
        this.writer.write(`set ${structure.name}()`);
        this.writer.conditionalWrite(structure.returnType != null && structure.returnType.length > 0, `: ${structure.returnType}`);
        this.writer.block();
    }
}
