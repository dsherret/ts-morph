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
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly decoratorWriter = new DecoratorStructurePrinter();
    private readonly modifierWriter = new ModifierableNodeStructurePrinter();
    private readonly typeParametersWriter = new TypeParameterDeclarationStructurePrinter();
    private readonly blankLineFormattingWriter = new BlankLineFormattingStructuresPrinter(this);
    private readonly propertyWriter = new PropertyDeclarationStructurePrinter();

    constructor(private readonly options: { isAmbient: boolean; }) {
        super();
    }

    printTexts(writer: CodeBlockWriter, structures: ClassDeclarationStructure[] | undefined) {
        this.blankLineFormattingWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: ClassDeclarationStructure) {
        const isAmbient = structure.hasDeclareKeyword || this.options.isAmbient;
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.decoratorWriter.printTexts(writer, structure.decorators);
        this.modifierWriter.printText(writer, structure);
        writer.write(`class`);
        // can be null, ex. `export default class { ... }`
        if (!StringUtils.isNullOrWhitespace(structure.name))
            writer.space().write(structure.name);
        this.typeParametersWriter.printTexts(writer, structure.typeParameters);
        writer.space();
        if (!StringUtils.isNullOrWhitespace(structure.extends))
            writer.write(`extends ${structure.extends} `);
        if (!ArrayUtils.isNullOrEmpty(structure.implements))
            writer.write(`implements ${structure.implements.join(", ")} `);
        writer.inlineBlock(() => {
            this.propertyWriter.printTexts(writer, structure.properties);
            if (structure.ctor != null) {
                this.conditionalSeparator(writer, isAmbient);
                new ConstructorDeclarationStructurePrinter({ isAmbient }).printText(writer, structure.ctor);
            }

            this.printGetAndSet(writer, structure, isAmbient);

            if (!ArrayUtils.isNullOrEmpty(structure.methods)) {
                this.conditionalSeparator(writer, isAmbient);
                new MethodDeclarationStructurePrinter({ isAmbient }).printTexts(writer, structure.methods);
            }
        });
    }

    private printGetAndSet(writer: CodeBlockWriter, structure: ClassDeclarationStructure, isAmbient: boolean) {
        const getAccessors = [...structure.getAccessors || []];
        const setAccessors = [...structure.setAccessors || []];
        const getAccessorWriter = new GetAccessorDeclarationStructurePrinter({ isAmbient });
        const setAccessorWriter = new SetAccessorDeclarationStructurePrinter({ isAmbient });

        for (const getAccessor of getAccessors) {
            this.conditionalSeparator(writer, isAmbient);
            getAccessorWriter.printText(writer, getAccessor);

            // write the corresponding set accessor beside the get accessor
            const setAccessorIndex = ArrayUtils.findIndex(setAccessors, item => item.name === getAccessor.name);
            if (setAccessorIndex >= 0) {
                this.conditionalSeparator(writer, isAmbient);
                setAccessorWriter.printText(writer, setAccessors[setAccessorIndex]);
                setAccessors.splice(setAccessorIndex, 1);
            }
        }

        for (const setAccessor of setAccessors) {
            this.conditionalSeparator(writer, isAmbient);
            setAccessorWriter.printText(writer, setAccessor);
        }
    }

    private conditionalSeparator(writer: CodeBlockWriter, isAmbient: boolean) {
        if (writer.isAtStartOfFirstLineOfBlock())
            return;

        if (isAmbient)
            writer.newLine();
        else
            writer.blankLine();
    }
}
