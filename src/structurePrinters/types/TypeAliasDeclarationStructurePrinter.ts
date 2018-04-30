import { CodeBlockWriter } from "../../codeBlockWriter";
import { TypeAliasDeclarationStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class TypeAliasDeclarationStructurePrinter extends FactoryStructurePrinter<TypeAliasDeclarationStructure> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: TypeAliasDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: TypeAliasDeclarationStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(`type ${structure.name}`);
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        this.factory.forTypedNode(" =").printText(writer, structure);
        writer.write(";");
    }
}
