import {PropertyDeclarationStructure} from "../../structures";
import {StringUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {DecoratorStructurePrinter} from "../decorator";

export class PropertyDeclarationStructurePrinter extends StructurePrinter<PropertyDeclarationStructure> {
    private readonly newLineWriter = new NewLineFormattingStructuresPrinter(this.writer, this);
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly decoratorWriter = new DecoratorStructurePrinter(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructurePrinter(this.writer);

    printTexts(structures: PropertyDeclarationStructure[] | undefined) {
        this.newLineWriter.printText(structures);
    }

    printText(structure: PropertyDeclarationStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.decoratorWriter.printTexts(structure.decorators);
        this.modifierWriter.printText(structure);
        this.writer.write(structure.name);
        this.writer.conditionalWrite(structure.hasQuestionToken, "?");
        this.writer.conditionalWrite(structure.hasExclamationToken && !structure.hasQuestionToken, "!");
        this.writer.conditionalWrite(!StringUtils.isNullOrWhitespace(structure.type), `: ${structure.type}`);
        this.writer.conditionalWrite(!StringUtils.isNullOrWhitespace(structure.initializer), ` = ${structure.initializer}`);
        this.writer.write(";");
    }
}
