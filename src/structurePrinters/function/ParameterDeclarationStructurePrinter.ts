import CodeBlockWriter from "code-block-writer";
﻿import {ParameterDeclarationStructure} from "../../structures";
import {StringUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {DecoratorStructurePrinter} from "../decorator";
import {CommaSeparatedStructuresPrinter} from "../formatting";

export class ParameterDeclarationStructurePrinter extends StructurePrinter<ParameterDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructurePrinter();
    private readonly commaSeparatedWriter = new CommaSeparatedStructuresPrinter(this);
    private readonly decoratorWriter = new DecoratorStructurePrinter();

    printTexts(writer: CodeBlockWriter, structures: ParameterDeclarationStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;
        this.commaSeparatedWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: ParameterDeclarationStructure) {
        this.decoratorWriter.printTextsInline(writer, structure.decorators);
        this.modifierWriter.printText(writer, structure);
        writer.conditionalWrite(structure.isRestParameter, "...");
        writer.write(structure.name);
        writer.conditionalWrite(structure.hasQuestionToken, "?");
        if (!StringUtils.isNullOrWhitespace(structure.type) || structure.hasQuestionToken)
            writer.write(`: ${structure.type || "any"}`);
        if (!StringUtils.isNullOrWhitespace(structure.initializer))
            writer.write(` = ${structure.initializer}`);
    }
}
