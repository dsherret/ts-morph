import { CodeBlockWriter } from "../../codeBlockWriter";
import { TypeAliasDeclarationStructure, OptionalKind } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class TypeAliasDeclarationStructurePrinter extends FactoryStructurePrinter<OptionalKind<TypeAliasDeclarationStructure>> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<TypeAliasDeclarationStructure>> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: OptionalKind<TypeAliasDeclarationStructure>) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(`type ${structure.name}`);
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        this.factory.forTypedNode(" =").printText(writer, structure);
        writer.write(";");
    }
}
