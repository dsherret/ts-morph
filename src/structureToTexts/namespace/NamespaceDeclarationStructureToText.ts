import {NamespaceDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";
import {ModifierableNodeStructureToText} from "./../base";

export class NamespaceDeclarationStructureToText extends StructureToText<NamespaceDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeText(structure: NamespaceDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`${structure.hasModuleKeyword ? "module" : "namespace"} ${structure.name}`).block();
    }
}
