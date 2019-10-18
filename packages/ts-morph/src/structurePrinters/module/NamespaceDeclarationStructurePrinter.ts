import { CodeBlockWriter } from "../../codeBlockWriter";
import { NamespaceDeclarationKind } from "../../compiler";
import { errors, StringUtils, ObjectUtils } from "@ts-morph/common";
import { StructurePrinterFactory } from "../../factories";
import { setValueIfUndefined } from "../../utils";
import { NamespaceDeclarationStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { BlankLineFormattingStructuresPrinter } from "../formatting";

export class NamespaceDeclarationStructurePrinter extends NodePrinter<OptionalKind<NamespaceDeclarationStructure>> {
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresPrinter(this);

    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<NamespaceDeclarationStructure>> | undefined) {
        this.blankLineFormattingWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<NamespaceDeclarationStructure>) {
        structure = this.validateAndGetStructure(structure);

        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        if (structure.declarationKind == null || structure.declarationKind !== NamespaceDeclarationKind.Global)
            writer.write(`${structure.declarationKind || "namespace"} ${structure.name} `);
        else
            writer.write("global ");

        writer.inlineBlock(() => {
            this.factory.forStatementedNode({
                isAmbient: structure.hasDeclareKeyword || this.options.isAmbient
            }).printText(writer, structure);
        });
    }

    private validateAndGetStructure(structure: OptionalKind<NamespaceDeclarationStructure>) {
        const name = structure.name.trim();
        if (!name.startsWith("'") && !name.startsWith(`"`))
            return structure;

        if (structure.declarationKind === NamespaceDeclarationKind.Namespace) {
            throw new errors.InvalidOperationError(`Cannot print a namespace with quotes for namespace with name ${structure.name}. `
                + `Use ${nameof.full(NamespaceDeclarationKind.Module)} instead.`);
        }

        structure = ObjectUtils.clone(structure);
        setValueIfUndefined(structure, "hasDeclareKeyword", true);
        setValueIfUndefined(structure, "declarationKind", NamespaceDeclarationKind.Module);
        return structure;
    }
}
