import CodeBlockWriter from "code-block-writer";
import {SetAccessorDeclarationStructure} from "../../structures";
import {StringUtils} from "../../utils";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {BlankLineFormattingStructuresToText} from "../formatting";
import {JSDocStructureToText} from "../doc";
import {DecoratorStructureToText} from "../decorator";
import {BodyTextStructureToText} from "../statement";
import {ParameterDeclarationStructureToText} from "../function";
import {TypeParameterDeclarationStructureToText} from "../types";

export class SetAccessorDeclarationStructureToText extends StructureToText<SetAccessorDeclarationStructure> {
    private readonly blankLineWriter = new BlankLineFormattingStructuresToText(this.writer, this);
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly decoratorWriter = new DecoratorStructureToText(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly parameterWriter = new ParameterDeclarationStructureToText(this.writer);
    private readonly typeParameterWriter = new TypeParameterDeclarationStructureToText(this.writer);
    private readonly bodyWriter = new BodyTextStructureToText(this.writer, this.options);

    constructor(writer: CodeBlockWriter, private readonly options: { isAmbient: boolean; }) {
        super(writer);
    }

    writeTexts(structures: SetAccessorDeclarationStructure[] | undefined) {
        this.blankLineWriter.writeText(structures);
    }

    writeText(structure: SetAccessorDeclarationStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.decoratorWriter.writeTexts(structure.decorators);
        this.modifierWriter.writeText(structure);
        this.writer.write(`set ${structure.name}`);
        this.typeParameterWriter.writeTexts(structure.typeParameters);
        this.writer.write("(");
        this.parameterWriter.writeTexts(structure.parameters);
        this.writer.write(")");
        this.writer.conditionalWrite(!StringUtils.isNullOrWhitespace(structure.returnType), `: ${structure.returnType}`);
        this.writer.spaceIfLastNot().inlineBlock(() => {
            this.bodyWriter.writeText(structure);
        });
    }
}
