import {ClassDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";
import {ModifierableNodeStructureToText} from "./../base";

export class ClassDeclarationStructureToText extends StructureToText<ClassDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeText(structure: ClassDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`class ${structure.name}`).block();
    }
}
