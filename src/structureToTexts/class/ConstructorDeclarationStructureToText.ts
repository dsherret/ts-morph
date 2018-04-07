import CodeBlockWriter from "code-block-writer";
import {ConstructorDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";

export class ConstructorDeclarationStructureToText extends StructureToText<ConstructorDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    constructor(writer: CodeBlockWriter, private readonly opts: { isAmbient: boolean; }) {
        super(writer);
    }

    writeText(structure: ConstructorDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write("constructor()");

        if (this.opts.isAmbient)
            this.writer.write(";");
        else
            this.writer.space().inlineBlock();
    }
}
