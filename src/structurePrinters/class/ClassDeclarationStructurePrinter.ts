import CodeBlockWriter from "code-block-writer";
import {ArrayUtils, StringUtils} from "../../utils";
import {ClassDeclarationStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {BlankLineFormattingStructuresPrinter} from "../formatting";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {DecoratorStructurePrinter} from "../decorator";
import {TypeParameterDeclarationStructurePrinter} from "../types";
import {PropertyDeclarationStructurePrinter} from "./PropertyDeclarationStructurePrinter";
import {ConstructorDeclarationStructurePrinter} from "./ConstructorDeclarationStructurePrinter";
import {MethodDeclarationStructurePrinter} from "./MethodDeclarationStructurePrinter";
import {GetAccessorDeclarationStructurePrinter} from "./GetAccessorDeclarationStructurePrinter";
import {SetAccessorDeclarationStructurePrinter} from "./SetAccessorDeclarationStructurePrinter";

export class ClassDeclarationStructurePrinter extends StructurePrinter<ClassDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly decoratorWriter = new DecoratorStructurePrinter(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructurePrinter(this.writer);
    private readonly typeParametersWriter = new TypeParameterDeclarationStructurePrinter(this.writer);
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresPrinter(this.writer, this);
    private readonly propertyWriter = new PropertyDeclarationStructurePrinter(this.writer);

    constructor(writer: CodeBlockWriter, private readonly options: { isAmbient: boolean; }) {
        super(writer);
    }

    printTexts(structures: ClassDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.printText(structures);
    }

    printText(structure: ClassDeclarationStructure) {
        const isAmbient = structure.hasDeclareKeyword || this.options.isAmbient;
        this.jsDocWriter.printDocs(structure.docs);
        this.decoratorWriter.printTexts(structure.decorators);
        this.modifierWriter.printText(structure);
        this.writer.write(`class`);
        // can be null, ex. `export default class { ... }`
        if (!StringUtils.isNullOrWhitespace(structure.name))
            this.writer.space().write(structure.name);
        this.typeParametersWriter.printTexts(structure.typeParameters);
        this.writer.space();
        if (!StringUtils.isNullOrWhitespace(structure.extends))
            this.writer.write(`extends ${structure.extends} `);
        if (!ArrayUtils.isNullOrEmpty(structure.implements))
            this.writer.write(`implements ${structure.implements.join(", ")} `);
        this.writer.inlineBlock(() => {
            this.propertyWriter.printTexts(structure.properties);
            if (structure.ctor != null) {
                this.conditionalSeparator(isAmbient);
                new ConstructorDeclarationStructurePrinter(this.writer, { isAmbient }).printText(structure.ctor);
            }

            this.printGetAndSet(structure, isAmbient);

            if (!ArrayUtils.isNullOrEmpty(structure.methods)) {
                this.conditionalSeparator(isAmbient);
                new MethodDeclarationStructurePrinter(this.writer, { isAmbient }).printTexts(structure.methods);
            }
        });
    }

    private printGetAndSet(structure: ClassDeclarationStructure, isAmbient: boolean) {
        const getAccessors = [...structure.getAccessors || []];
        const setAccessors = [...structure.setAccessors || []];
        const getAccessorWriter = new GetAccessorDeclarationStructurePrinter(this.writer, { isAmbient });
        const setAccessorWriter = new SetAccessorDeclarationStructurePrinter(this.writer, { isAmbient });

        for (const getAccessor of getAccessors) {
            this.conditionalSeparator(isAmbient);
            getAccessorWriter.printText(getAccessor);

            // write the corresponding set accessor beside the get accessor
            const setAccessorIndex = ArrayUtils.findIndex(setAccessors, item => item.name === getAccessor.name);
            if (setAccessorIndex >= 0) {
                this.conditionalSeparator(isAmbient);
                setAccessorWriter.printText(setAccessors[setAccessorIndex]);
                setAccessors.splice(setAccessorIndex, 1);
            }
        }

        for (const setAccessor of setAccessors) {
            this.conditionalSeparator(isAmbient);
            setAccessorWriter.printText(setAccessor);
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
