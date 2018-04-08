import CodeBlockWriter from "code-block-writer";
import {ArrayUtils, StringUtils} from "../../utils";
import {ClassDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {BlankLineFormattingStructuresToText} from "../formatting";
import {ModifierableNodeStructureToText} from "../base";
import {JSDocStructureToText} from "../doc";
import {DecoratorStructureToText} from "../decorator";
import {TypeParameterDeclarationStructureToText} from "../types";
import {PropertyDeclarationStructureToText} from "./PropertyDeclarationStructureToText";
import {ConstructorDeclarationStructureToText} from "./ConstructorDeclarationStructureToText";
import {MethodDeclarationStructureToText} from "./MethodDeclarationStructureToText";
import {GetAccessorDeclarationStructureToText} from "./GetAccessorDeclarationStructureToText";
import {SetAccessorDeclarationStructureToText} from "./SetAccessorDeclarationStructureToText";

export class ClassDeclarationStructureToText extends StructureToText<ClassDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly decoratorWriter = new DecoratorStructureToText(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly typeParametersWriter = new TypeParameterDeclarationStructureToText(this.writer);
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresToText(this.writer, this);
    private readonly propertyWriter = new PropertyDeclarationStructureToText(this.writer);

    constructor(writer: CodeBlockWriter, private readonly options: { isAmbient: boolean; }) {
        super(writer);
    }

    writeTexts(structures: ClassDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.writeText(structures);
    }

    writeText(structure: ClassDeclarationStructure) {
        const isAmbient = structure.hasDeclareKeyword || this.options.isAmbient;
        this.jsDocWriter.writeDocs(structure.docs);
        this.decoratorWriter.writeTexts(structure.decorators);
        this.modifierWriter.writeText(structure);
        this.writer.write(`class`);
        // can be null, ex. `export default class { ... }`
        if (!StringUtils.isNullOrWhitespace(structure.name))
            this.writer.space().write(structure.name);
        this.typeParametersWriter.writeTexts(structure.typeParameters);
        this.writer.space();
        if (!StringUtils.isNullOrWhitespace(structure.extends))
            this.writer.write(`extends ${structure.extends} `);
        if (!ArrayUtils.isNullOrEmpty(structure.implements))
            this.writer.write(`implements ${structure.implements.join(", ")} `);
        this.writer.inlineBlock(() => {
            this.propertyWriter.writeTexts(structure.properties);
            if (structure.ctor != null) {
                this.conditionalSeparator(isAmbient);
                new ConstructorDeclarationStructureToText(this.writer, { isAmbient }).writeText(structure.ctor);
            }

            this.writeGetAndSet(structure, isAmbient);

            if (!ArrayUtils.isNullOrEmpty(structure.methods)) {
                this.conditionalSeparator(isAmbient);
                new MethodDeclarationStructureToText(this.writer, { isAmbient }).writeTexts(structure.methods);
            }
        });
    }

    private writeGetAndSet(structure: ClassDeclarationStructure, isAmbient: boolean) {
        const getAccessors = [...structure.getAccessors || []];
        const setAccessors = [...structure.setAccessors || []];
        const getAccessorWriter = new GetAccessorDeclarationStructureToText(this.writer, { isAmbient });
        const setAccessorWriter = new SetAccessorDeclarationStructureToText(this.writer, { isAmbient });

        for (const getAccessor of getAccessors) {
            this.conditionalSeparator(isAmbient);
            getAccessorWriter.writeText(getAccessor);

            // write the corresponding set accessor beside the get accessor
            const setAccessorIndex = ArrayUtils.findIndex(setAccessors, item => item.name === getAccessor.name);
            if (setAccessorIndex >= 0) {
                this.conditionalSeparator(isAmbient);
                setAccessorWriter.writeText(setAccessors[setAccessorIndex]);
                setAccessors.splice(setAccessorIndex, 1);
            }
        }

        for (const setAccessor of setAccessors) {
            this.conditionalSeparator(isAmbient);
            setAccessorWriter.writeText(setAccessor);
        }
    }

    private conditionalSeparator(isAmbient: boolean) {
        if (this.writer.isAtStartOfFirstLineOfBlock())
            return;

        if (isAmbient)
            this.writer.newLine();
        else
            this.writer.blankLine();
    }
}
