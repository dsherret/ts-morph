import { CodeBlockWriter } from "../../codeBlockWriter";
import { PropertyDeclarationStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class PropertyDeclarationStructurePrinter extends FactoryStructurePrinter<PropertyDeclarationStructure> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: PropertyDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: PropertyDeclarationStructure) {
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
