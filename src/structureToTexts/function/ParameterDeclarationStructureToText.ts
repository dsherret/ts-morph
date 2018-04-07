import {ParameterDeclarationStructure} from "../../structures";
import {StringUtils} from "../../utils";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {DecoratorStructureToText} from "../decorator";
import {CommaSeparatedStructuresToText} from "../formatting";

export class ParameterDeclarationStructureToText extends StructureToText<ParameterDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly commaSeparatedWriter = new CommaSeparatedStructuresToText(this.writer, this);
    private readonly decoratorWriter = new DecoratorStructureToText(this.writer);

    writeTexts(structures: ParameterDeclarationStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;
        this.commaSeparatedWriter.writeText(structures);
    }

    writeText(structure: ParameterDeclarationStructure) {
        this.decoratorWriter.writeTextsInline(structure.decorators);
        this.modifierWriter.writeText(structure);
        this.writer.conditionalWrite(structure.isRestParameter, "...");
        this.writer.write(structure.name);
        this.writer.conditionalWrite(structure.hasQuestionToken, "?");
        if (!StringUtils.isNullOrWhitespace(structure.type) || structure.hasQuestionToken)
            this.writer.write(`: ${structure.type || "any"}`);
        if (!StringUtils.isNullOrWhitespace(structure.initializer))
            this.writer.write(` = ${structure.initializer}`);
    }
}
