import CodeBlockWriter from "code-block-writer";
import {NamespaceDeclarationStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {BlankLineFormattingStructuresPrinter} from "../formatting";
import {BodyTextStructurePrinter} from "../statement";

export class NamespaceDeclarationStructurePrinter extends StructurePrinter<NamespaceDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly modifierWriter = new ModifierableNodeStructurePrinter();
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresPrinter(this);

    constructor(private readonly options: { isAmbient: boolean; }) {
        super();
    }

    printTexts(writer: CodeBlockWriter, structures: NamespaceDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: NamespaceDeclarationStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.modifierWriter.printText(writer, structure);
        writer.write(`${structure.hasModuleKeyword ? "module" : "namespace"} ${structure.name} `).inlineBlock(() => {
            new BodyTextStructurePrinter({
                isAmbient: structure.hasDeclareKeyword || this.options.isAmbient
            }).printText(writer, structure);
        });
    }
}
