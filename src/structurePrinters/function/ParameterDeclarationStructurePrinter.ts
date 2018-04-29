import { CodeBlockWriter } from "../../codeBlockWriter";
import { ParameterDeclarationStructure } from "../../structures";
import { StringUtils } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { CommaSeparatedStructuresPrinter } from "../formatting";

export class ParameterDeclarationStructurePrinter extends FactoryStructurePrinter<ParameterDeclarationStructure> {
    private readonly multipleWriter = new CommaSeparatedStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ParameterDeclarationStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: ParameterDeclarationStructure) {
        this.factory.forDecorator().printTextsInline(writer, structure.decorators);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.conditionalWrite(structure.isRestParameter, "...");
        writer.write(structure.name);
        writer.conditionalWrite(structure.hasQuestionToken, "?");
        if (!StringUtils.isNullOrWhitespace(structure.type) || structure.hasQuestionToken)
            writer.write(`: ${structure.type || "any"}`);
        this.factory.forInitializerExpressionableNode().printText(writer, structure);
    }
}
