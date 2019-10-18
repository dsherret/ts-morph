import { ObjectUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { ConstructorDeclarationOverloadStructure, ConstructorDeclarationStructure, OptionalKind } from "../../structures";
import { setValueIfUndefined } from "../../utils";
import { NodePrinter } from "../NodePrinter";

export class ConstructorDeclarationStructurePrinter extends NodePrinter<OptionalKind<ConstructorDeclarationStructure>> {
    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ConstructorDeclarationStructure>> | undefined) {
        // todo: move this code to a common printer similar to blank line formatting structure printer
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            if (i > 0) {
                if (this.options.isAmbient)
                    writer.newLine();
                else
                    writer.blankLine();
            }
            this.printText(writer, structures[i]);
        }
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ConstructorDeclarationStructure>) {
        this.printOverloads(writer, getOverloadStructures());
        this.printHeader(writer, structure);
        if (this.options.isAmbient)
            writer.write(";");
        else {
            writer.space().inlineBlock(() => {
                this.factory.forStatementedNode(this.options).printText(writer, structure);
            });
        }

        function getOverloadStructures() {
            // all the overloads need to have the same scope as the implementation
            const overloads = ObjectUtils.clone(structure.overloads);
            if (overloads == null || overloads.length === 0)
                return;

            for (const overload of overloads)
                setValueIfUndefined(overload, "scope", structure.scope);

            return overloads;
        }
    }

    private printOverloads(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ConstructorDeclarationOverloadStructure>> | undefined) {
        if (structures == null || structures.length === 0)
            return;

        for (const structure of structures) {
            this.printOverload(writer, structure);
            writer.newLine();
        }
    }

    printOverload(writer: CodeBlockWriter, structure: OptionalKind<ConstructorDeclarationOverloadStructure>) {
        this.printHeader(writer, structure);
        writer.write(";");
    }

    private printHeader(writer: CodeBlockWriter, structure: OptionalKind<ConstructorDeclarationStructure | ConstructorDeclarationOverloadStructure>) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.write("constructor");
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        this.factory.forParameterDeclaration().printTextsWithParenthesis(writer, structure.parameters);
    }
}
