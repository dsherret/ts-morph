import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { SetAccessorDeclarationStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { BlankLineFormattingStructuresPrinter } from "../formatting";

export class SetAccessorDeclarationStructurePrinter extends NodePrinter<OptionalKind<SetAccessorDeclarationStructure>> {
    private readonly multipleWriter = new BlankLineFormattingStructuresPrinter(this);

    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<SetAccessorDeclarationStructure>) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forDecorator().printTexts(writer, structure.decorators);

        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(`set ${structure.name}`);
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        this.factory.forParameterDeclaration().printTextsWithParenthesis(writer, structure.parameters);
        this.factory.forReturnTypedNode().printText(writer, structure);

        if (this.options.isAmbient || structure.isAbstract)
            writer.write(";");
        else {
            writer.spaceIfLastNot().inlineBlock(() => {
                this.factory.forStatementedNode(this.options).printText(writer, structure);
            });
        }
    }
}
