import {ClassDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class ClassDeclarationStructureToText extends StructureToText<ClassDeclarationStructure> {
    writeText(structure: ClassDeclarationStructure) {
        this.writer.write(`class ${structure.name}`).block();
    }
}
