import {InterfaceDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class InterfaceDeclarationStructureToText extends StructureToText<InterfaceDeclarationStructure> {
    writeText(structure: InterfaceDeclarationStructure) {
        this.writer.write(`interface ${structure.name} `).block();
    }
}
