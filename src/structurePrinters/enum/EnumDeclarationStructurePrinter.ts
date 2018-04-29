import { CodeBlockWriter } from "../../codeBlockWriter";
import { EnumDeclarationStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { BlankLineFormattingStructuresPrinter } from "../formatting";

export class EnumDeclarationStructurePrinter extends FactoryStructurePrinter<EnumDeclarationStructure> {
    private readonly multipleWriter = new BlankLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: EnumDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: EnumDeclarationStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.conditionalWrite(structure.isConst, "const ");
        writer.write(`enum ${structure.name} `).inlineBlock(() => {
            this.factory.forEnumMember().printTexts(writer, structure.members);
        });
    }
}
