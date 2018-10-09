import { CodeBlockWriter } from "../../codeBlockWriter";
import { InterfaceDeclarationStructure } from "../../structures";
import { StringUtils } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { BlankLineFormattingStructuresPrinter } from "../formatting";

export class InterfaceDeclarationStructurePrinter extends FactoryStructurePrinter<InterfaceDeclarationStructure> {
    private readonly multipleWriter = new BlankLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<InterfaceDeclarationStructure> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: InterfaceDeclarationStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(`interface ${structure.name}`);
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        writer.space();

        if (structure.extends != null) {
            const extendsText = structure.extends instanceof Array
                ? structure.extends.map(i => this.getTextWithQueuedChildIndentation(writer, i)).join(", ")
                : this.getTextWithQueuedChildIndentation(writer, structure.extends);

            if (!StringUtils.isNullOrWhitespace(extendsText))
                writer.write(`extends ${extendsText} `);
        }

        writer.inlineBlock(() => {
            this.factory.forTypeElementMemberedNode().printText(writer, structure);
        });
    }
}
