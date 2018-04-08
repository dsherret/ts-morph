import {ParameterDeclarationStructure} from "../../structures";
import {StringUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {DecoratorStructurePrinter} from "../decorator";
import {CommaSeparatedStructuresPrinter} from "../formatting";

export class ParameterDeclarationStructurePrinter extends StructurePrinter<ParameterDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructurePrinter(this.writer);
    private readonly commaSeparatedWriter = new CommaSeparatedStructuresPrinter(this.writer, this);
    private readonly decoratorWriter = new DecoratorStructurePrinter(this.writer);

    printTexts(structures: ParameterDeclarationStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;
        this.commaSeparatedWriter.printText(structures);
    }

    printText(structure: ParameterDeclarationStructure) {
        this.decoratorWriter.printTextsInline(structure.decorators);
        this.modifierWriter.printText(structure);
        this.writer.conditionalWrite(structure.isRestParameter, "...");
        this.writer.write(structure.name);
        this.writer.conditionalWrite(structure.hasQuestionToken, "?");
        if (!StringUtils.isNullOrWhitespace(structure.type) || structure.hasQuestionToken)
            this.writer.write(`: ${structure.type || "any"}`);
        if (!StringUtils.isNullOrWhitespace(structure.initializer))
            this.writer.write(` = ${structure.initializer}`);
    }
}
