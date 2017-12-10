import {GetAccessorDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class GetAccessorDeclarationStructureToText extends StructureToText<GetAccessorDeclarationStructure> {
    writeText(structure: GetAccessorDeclarationStructure) {
        this.writer.conditionalWrite(structure.isStatic, "static ");
        this.writer.write(`get ${structure.name}()`);
        this.writer.conditionalWrite(structure.returnType != null && structure.returnType.length > 0, `: ${structure.returnType}`);
        this.writer.block();
    }
}
