import { CodeBlockWriter } from "../../codeBlockWriter";
import { InterfaceDeclarationStructure } from "../../structures";
import { ArrayUtils } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { BlankLineFormattingStructuresPrinter } from "../formatting";

export class InterfaceDeclarationStructurePrinter extends FactoryStructurePrinter<InterfaceDeclarationStructure> {
    private readonly multipleWriter = new BlankLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: InterfaceDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: InterfaceDeclarationStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(`interface ${structure.name}`);
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        writer.space();
        if (!ArrayUtils.isNullOrEmpty(structure.extends))
            writer.write(`extends ${structure.extends.join(", ")} `);
        writer.inlineBlock(() => {
            this.factory.forTypeElementMemberedNode().printText(writer, structure);
        });
    }
}
