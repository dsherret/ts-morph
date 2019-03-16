import { CodeBlockWriter } from "../../codeBlockWriter";
import { NamespaceDeclarationKind } from "../../compiler";
import * as errors from "../../errors";
import { StructurePrinterFactory } from "../../factories";
import { ArrayUtils, StringUtils, ObjectUtils, setValueIfUndefined } from "../../utils";
import { NamespaceDeclarationStructure, OptionalKind } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { BlankLineFormattingStructuresPrinter } from "../formatting";

export class NamespaceDeclarationStructurePrinter extends FactoryStructurePrinter<OptionalKind<NamespaceDeclarationStructure>> {
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresPrinter(this);

    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<NamespaceDeclarationStructure>> | undefined) {
        this.blankLineFormattingWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: OptionalKind<NamespaceDeclarationStructure>) {
        structure = this.validateAndGetStructure(structure);

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

    private conditionalBlankLine(writer: CodeBlockWriter, structures: ReadonlyArray<unknown> | undefined) {
        if (!ArrayUtils.isNullOrEmpty(structures))
            writer.conditionalBlankLine(!writer.isAtStartOfFirstLineOfBlock());
    }

    private validateAndGetStructure(structure: OptionalKind<NamespaceDeclarationStructure>) {
        const name = structure.name.trim();
        if (!StringUtils.startsWith(name, "'") && !StringUtils.startsWith(name, `"`))
            return structure;

        if (structure.declarationKind === NamespaceDeclarationKind.Namespace)
            throw new errors.InvalidOperationError(`Cannot print a namespace with quotes for namespace with name ${structure.name}. ` +
                `Use ${nameof.full(NamespaceDeclarationKind.Module)} instead.`);

        structure = ObjectUtils.clone(structure);
        setValueIfUndefined(structure, "hasDeclareKeyword", true);
        setValueIfUndefined(structure, "declarationKind", NamespaceDeclarationKind.Module);
        return structure;
    }
}
