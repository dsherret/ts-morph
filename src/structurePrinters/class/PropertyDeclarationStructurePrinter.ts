import CodeBlockWriter from "code-block-writer";
import { PropertyDeclarationStructure } from "../../structures";
import {StringUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {DecoratorStructurePrinter} from "../decorator";

export class PropertyDeclarationStructurePrinter extends StructurePrinter<PropertyDeclarationStructure> {
    private readonly newLineWriter = new NewLineFormattingStructuresPrinter(this);
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly decoratorWriter = new DecoratorStructurePrinter();
    private readonly modifierWriter = new ModifierableNodeStructurePrinter();

    printTexts(writer: CodeBlockWriter, structures: PropertyDeclarationStructure[] | undefined) {
        this.newLineWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: PropertyDeclarationStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.decoratorWriter.printTexts(writer, structure.decorators);
        this.modifierWriter.printText(writer, structure);
        writer.write(structure.name);
        writer.conditionalWrite(structure.hasQuestionToken, "?");
        writer.conditionalWrite(structure.hasExclamationToken && !structure.hasQuestionToken, "!");
        writer.conditionalWrite(!StringUtils.isNullOrWhitespace(structure.type), `: ${structure.type}`);
        writer.conditionalWrite(!StringUtils.isNullOrWhitespace(structure.initializer), ` = ${structure.initializer}`);
        writer.write(";");
    }
}
