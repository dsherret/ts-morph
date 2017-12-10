import {FunctionDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class FunctionDeclarationStructureToText extends StructureToText<FunctionDeclarationStructure> {
    writeText(structure: FunctionDeclarationStructure) {
        this.writer.write(`function ${structure.name}()`).block();
    }
}
