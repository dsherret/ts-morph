import CodeBlockWriter from "code-block-writer";
import {NamespaceDeclarationStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {BlankLineFormattingStructuresPrinter} from "../formatting";
import {BodyTextStructurePrinter} from "../statement";

export class NamespaceDeclarationStructurePrinter extends StructurePrinter<NamespaceDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructurePrinter(this.writer);
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresPrinter(this.writer, this);

    constructor(writer: CodeBlockWriter, private readonly options: { isAmbient: boolean; }) {
        super(writer);
    }

    printTexts(structures: NamespaceDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.printText(structures);
    }

    printText(structure: NamespaceDeclarationStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.modifierWriter.printText(structure);
        this.writer.write(`${structure.hasModuleKeyword ? "module" : "namespace"} ${structure.name} `).inlineBlock(() => {
            new BodyTextStructurePrinter(this.writer, {
                isAmbient: structure.hasDeclareKeyword || this.options.isAmbient
            }).printText(structure);
        });
    }
}
