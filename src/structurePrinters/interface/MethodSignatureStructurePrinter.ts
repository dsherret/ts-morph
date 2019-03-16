import { CodeBlockWriter } from "../../codeBlockWriter";
import { MethodSignatureStructure, OptionalKind } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class MethodSignatureStructurePrinter extends FactoryStructurePrinter<OptionalKind<MethodSignatureStructure>> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<MethodSignatureStructure>> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: OptionalKind<MethodSignatureStructure>) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        writer.write(structure.name);
        writer.conditionalWrite(structure.hasQuestionToken, "?");
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        writer.write("(");
        this.factory.forParameterDeclaration().printTexts(writer, structure.parameters);
        writer.write(")");
        this.factory.forReturnTypedNode().printText(writer, structure);
        writer.write(";");
    }
}
