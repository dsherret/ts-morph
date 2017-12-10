import {ConstructorDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class ConstructorDeclarationStructureToText extends StructureToText<ConstructorDeclarationStructure> {
    writeText(structure: ConstructorDeclarationStructure) {
        this.writer.write("constructor()").block();
    }
}
