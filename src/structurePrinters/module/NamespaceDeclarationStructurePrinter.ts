import { CodeBlockWriter } from "../../codeBlockWriter";
import { NamespaceDeclarationKind } from "../../compiler";
import { StructurePrinterFactory } from "../../factories";
import { ArrayUtils } from "../../utils";
import { NamespaceDeclarationStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { BlankLineFormattingStructuresPrinter } from "../formatting";

export class NamespaceDeclarationStructurePrinter extends FactoryStructurePrinter<NamespaceDeclarationStructure> {
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresPrinter(this);

    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<NamespaceDeclarationStructure> | undefined) {
        this.blankLineFormattingWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: NamespaceDeclarationStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        if (structure.declarationKind == null || structure.declarationKind !== NamespaceDeclarationKind.Global)
            writer.write(`${structure.declarationKind || "namespace"} ${structure.name} `);
        else
            writer.write("global ");

        writer.inlineBlock(() => {
            this.factory.forImportDeclaration().printTexts(writer, structure.imports);

            this.factory.forBodyText({
                isAmbient: structure.hasDeclareKeyword || this.options.isAmbient
            }).printText(writer, structure);

            this.conditionalBlankLine(writer, structure.exports);
            this.factory.forExportDeclaration().printTexts(writer, structure.exports);
        });
    }

    private conditionalBlankLine(writer: CodeBlockWriter, structures: ReadonlyArray<any> | undefined) {
        if (!ArrayUtils.isNullOrEmpty(structures))
            writer.conditionalBlankLine(!writer.isAtStartOfFirstLineOfBlock());
    }
}
