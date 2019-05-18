import { CodeBlockWriter } from "../../codeBlockWriter";
import { PropertyDeclarationStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class PropertyDeclarationStructurePrinter extends NodePrinter<OptionalKind<PropertyDeclarationStructure>> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<PropertyDeclarationStructure>> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<PropertyDeclarationStructure>) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forDecorator().printTexts(writer, structure.decorators);

        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(structure.name);
        writer.conditionalWrite(structure.hasQuestionToken, "?");
        writer.conditionalWrite(structure.hasExclamationToken && !structure.hasQuestionToken, "!");
        this.factory.forTypedNode(":").printText(writer, structure);
        this.factory.forInitializerExpressionableNode().printText(writer, structure);
        writer.write(";");
    }
}
