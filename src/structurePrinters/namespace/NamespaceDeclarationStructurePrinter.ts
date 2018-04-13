import CodeBlockWriter from "code-block-writer";
import {NamespaceDeclarationStructure} from "../../structures";
import {StructurePrinterFactory} from "../../factories";
import {FactoryStructurePrinter} from "../FactoryStructurePrinter";
import {BlankLineFormattingStructuresPrinter} from "../formatting";

export class NamespaceDeclarationStructurePrinter extends FactoryStructurePrinter<NamespaceDeclarationStructure> {
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresPrinter(this);

    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    printTexts(writer: CodeBlockWriter, structures: NamespaceDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: NamespaceDeclarationStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(`${structure.hasModuleKeyword ? "module" : "namespace"} ${structure.name} `).inlineBlock(() => {
            this.factory.forBodyText({
                isAmbient: structure.hasDeclareKeyword || this.options.isAmbient
            }).printText(writer, structure);
        });
    }
}
