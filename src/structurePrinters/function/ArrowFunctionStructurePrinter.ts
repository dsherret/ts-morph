import { CodeBlockWriter } from "../../codeBlockWriter";
import { ArrowFunctionStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class ArrowFunctionStructurePrinter extends FactoryStructurePrinter<ArrowFunctionStructure> {
    printTexts(writer: CodeBlockWriter, structures: ArrowFunctionStructure[] | undefined) {
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            const currentStructure = structures[i];
            if (i > 0)
                writer.newLine();

            this.printText(writer, currentStructure);
        }
    }

    printText(writer: CodeBlockWriter, structure: ArrowFunctionStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        writer.write("(");
        if (structure.parameters != null)
            this.factory.forParameterDeclaration().printTexts(writer, structure.parameters);
        writer.write(`)`);
        this.factory.forReturnTypedNode().printText(writer, structure);
        writer.write(`=>`);
        if (structure.singleBodyExpression)
            writer.write(structure.singleBodyExpression);
        else
            writer.space().inlineBlock(() => {
                this.factory.forBodyText({ isAmbient: false }).printText(writer, structure);
            });
    }
}
