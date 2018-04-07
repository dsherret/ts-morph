import {PropertyDeclarationStructure} from "../../structures";
import {StringUtils} from "../../utils";
import {StructureToText} from "../StructureToText";
import {NewLineFormattingStructuresToText} from "../formatting";
import {ModifierableNodeStructureToText} from "../base";
import {JSDocStructureToText} from "../doc";
import {DecoratorStructureToText} from "../decorator";

export class PropertyDeclarationStructureToText extends StructureToText<PropertyDeclarationStructure> {
    private readonly newLineWriter = new NewLineFormattingStructuresToText(this.writer, this);
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly decoratorWriter = new DecoratorStructureToText(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeTexts(structures: PropertyDeclarationStructure[]) {
        this.newLineWriter.writeText(structures);
    }

    writeText(structure: PropertyDeclarationStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.decoratorWriter.writeTexts(structure.decorators);
        this.modifierWriter.writeText(structure);
        this.writer.write(structure.name);
        this.writer.conditionalWrite(structure.hasQuestionToken, "?");
        this.writer.conditionalWrite(structure.hasExclamationToken && !structure.hasQuestionToken, "!");
        this.writer.conditionalWrite(!StringUtils.isNullOrWhitespace(structure.type), `: ${structure.type}`);
        this.writer.conditionalWrite(!StringUtils.isNullOrWhitespace(structure.initializer), ` = ${structure.initializer}`);
        this.writer.write(";");
    }
}
