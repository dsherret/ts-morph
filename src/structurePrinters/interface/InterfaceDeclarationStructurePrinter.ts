import { CodeBlockWriter } from "../../codeBlockWriter";
import { InterfaceDeclarationStructure } from "../../structures";
import { ArrayUtils } from "../../utils";
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

        if (structure.extends instanceof Array && !ArrayUtils.isNullOrEmpty(structure.extends))
            writer.write(`extends ${structure.extends.map(e => this.getTextWithQueuedChildIndentation(writer, e)).join(", ")} `);
        else if (structure.extends instanceof Function)
            writer.write(`extends ${this.getTextWithQueuedChildIndentation(writer, structure.extends)} `);

        writer.inlineBlock(() => {
            this.factory.forTypeElementMemberedNode().printText(writer, structure);
        });
    }
}
