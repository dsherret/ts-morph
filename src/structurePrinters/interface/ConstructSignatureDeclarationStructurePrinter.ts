import { CodeBlockWriter } from "../../codeBlockWriter";
import { ConstructSignatureDeclarationStructure, OptionalKind } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class ConstructSignatureDeclarationStructurePrinter extends FactoryStructurePrinter<OptionalKind<ConstructSignatureDeclarationStructure>> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ConstructSignatureDeclarationStructure>> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: OptionalKind<ConstructSignatureDeclarationStructure>) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        writer.write("new");
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        writer.write("(");
        this.factory.forParameterDeclaration().printTexts(writer, structure.parameters);
        writer.write(")");
        this.factory.forReturnTypedNode().printText(writer, structure);
        writer.write(";");
    }
}
