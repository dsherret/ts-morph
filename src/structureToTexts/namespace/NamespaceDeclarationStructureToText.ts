import CodeBlockWriter from "code-block-writer";
import {NamespaceDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {JSDocStructureToText} from "../doc";
import {BlankLineFormattingStructuresToText} from "../formatting";
import {BodyTextStructureToText} from "../statement";

export class NamespaceDeclarationStructureToText extends StructureToText<NamespaceDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresToText(this.writer, this);

    constructor(writer: CodeBlockWriter, private readonly options: { isAmbient: boolean; }) {
        super(writer);
    }

    writeTexts(structures: NamespaceDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.writeText(structures);
    }

    writeText(structure: NamespaceDeclarationStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.modifierWriter.writeText(structure);
        this.writer.write(`${structure.hasModuleKeyword ? "module" : "namespace"} ${structure.name} `).inlineBlock(() => {
            new BodyTextStructureToText(this.writer, {
                isAmbient: structure.hasDeclareKeyword || this.options.isAmbient
            }).writeText(structure);
        });
    }
}
