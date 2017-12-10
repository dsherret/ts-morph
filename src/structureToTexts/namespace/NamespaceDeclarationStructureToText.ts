import {NamespaceDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class NamespaceDeclarationStructureToText extends StructureToText<NamespaceDeclarationStructure> {
    writeText(structure: NamespaceDeclarationStructure) {
        this.writer.write(`${structure.hasModuleKeyword ? "module" : "namespace"} ${structure.name}`).block();
    }
}
