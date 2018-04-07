import {StringUtils} from "../../utils";
import {ClassDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {BlankLineFormattingStructuresToText} from "../formatting";

export class ClassDeclarationStructureToText extends StructureToText<ClassDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresToText(this.writer, this);

    writeTexts(structures: ClassDeclarationStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        this.blankLineFormattingWriter.writeText(structures);
    }

    writeText(structure: ClassDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`class `);
        // can be null, ex. `export default class { ... }`
        if (!StringUtils.isNullOrWhitespace(structure.name))
            this.writer.write(structure.name).write(" ");
        this.writer.inlineBlock();
    }
}
