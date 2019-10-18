import { StringUtils, ObjectUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { FunctionDeclarationOverloadStructure, FunctionDeclarationStructure, OptionalKind } from "../../structures";
import { setValueIfUndefined } from "../../utils";
import { NodePrinter } from "../NodePrinter";

export class FunctionDeclarationStructurePrinter extends NodePrinter<OptionalKind<FunctionDeclarationStructure>> {
    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<FunctionDeclarationStructure>> | undefined) {
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            const currentStructure = structures[i];
            if (i > 0) {
                const previousStructure = structures[i - 1];
                if (this.options.isAmbient || previousStructure.hasDeclareKeyword && currentStructure.hasDeclareKeyword)
                    writer.newLine();
                else
                    writer.blankLine();
            }

            this.printText(writer, currentStructure);
        }
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<FunctionDeclarationStructure>) {
        this.printOverloads(writer, structure.name, getOverloadStructures());
        this.printHeader(writer, structure.name, structure);
        if (this.options.isAmbient || structure.hasDeclareKeyword)
            writer.write(";");
        else {
            writer.space().inlineBlock(() => {
                this.factory.forStatementedNode({ isAmbient: false }).printText(writer, structure);
            });
        }

        function getOverloadStructures() {
            // all the overloads need to have similar properties as the implementation
            const overloads = ObjectUtils.clone(structure.overloads);
            if (overloads == null || overloads.length === 0)
                return;

            for (const overload of overloads) {
                setValueIfUndefined(overload, "hasDeclareKeyword", structure.hasDeclareKeyword);
                setValueIfUndefined(overload, "isExported", structure.isExported);
                setValueIfUndefined(overload, "isDefaultExport", structure.isDefaultExport);
            }

            return overloads;
        }
    }

    private printOverloads(
        writer: CodeBlockWriter,
        name: string | undefined,
        structures: ReadonlyArray<OptionalKind<FunctionDeclarationOverloadStructure>> | undefined
    ) {
        if (structures == null || structures.length === 0)
            return;

        for (const structure of structures) {
            this.printOverload(writer, name, structure);
            writer.newLine();
        }
    }

    printOverload(writer: CodeBlockWriter, name: string | undefined, structure: OptionalKind<FunctionDeclarationOverloadStructure>) {
        this.printHeader(writer, name, structure);
        writer.write(";");
    }

    private printHeader(
        writer: CodeBlockWriter,
        name: string | undefined,
        structure: OptionalKind<FunctionDeclarationOverloadStructure> | OptionalKind<FunctionDeclarationStructure>
    ) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);

        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(`function`);
        writer.conditionalWrite(structure.isGenerator, "*");
        if (!StringUtils.isNullOrWhitespace(name))
            writer.write(` ${name}`);
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        this.factory.forParameterDeclaration().printTextsWithParenthesis(writer, structure.parameters);
        this.factory.forReturnTypedNode().printText(writer, structure);
    }
}
