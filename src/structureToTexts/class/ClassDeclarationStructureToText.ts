import {StringUtils} from "../../utils";
import {ClassDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";

export class ClassDeclarationStructureToText extends StructureToText<ClassDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeText(structure: ClassDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`class `);
        // can be null, ex. `export default class { ... }`
        if (!StringUtils.isNullOrWhitespace(structure.name))
            this.writer.write(structure.name).write(" ");
        this.writer.inlineBlock();
    }
}
