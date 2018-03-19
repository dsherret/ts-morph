import {InterfaceDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";

export class InterfaceDeclarationStructureToText extends StructureToText<InterfaceDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeText(structure: InterfaceDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`interface ${structure.name} `).block();
    }
}
