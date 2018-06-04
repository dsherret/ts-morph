import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { ClassDeclarationStructure } from "../../structures";
import { ArrayUtils, StringUtils } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { BlankLineFormattingStructuresPrinter } from "../formatting";

export class ClassDeclarationStructurePrinter extends FactoryStructurePrinter<ClassDeclarationStructure> {
    private readonly multipleWriter = new BlankLineFormattingStructuresPrinter(this);

    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    printTexts(writer: CodeBlockWriter, structures: ClassDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: ClassDeclarationStructure) {
        const isAmbient = structure.hasDeclareKeyword || this.options.isAmbient;
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forDecorator().printTexts(writer, structure.decorators);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(`class`);
        // can be null, ex. `export default class { ... }`
        if (!StringUtils.isNullOrWhitespace(structure.name))
            writer.space().write(structure.name);
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        writer.space();
        if (!StringUtils.isNullOrWhitespace(structure.extends))
            writer.write(`extends ${structure.extends} `);
        if (!ArrayUtils.isNullOrEmpty(structure.implements))
            writer.write(`implements ${structure.implements.join(", ")} `);
        writer.inlineBlock(() => {
            this.factory.forPropertyDeclaration().printTexts(writer, structure.properties);
            this.printCtors(writer, structure, isAmbient);
            this.printGetAndSet(writer, structure, isAmbient);

            if (!ArrayUtils.isNullOrEmpty(structure.methods)) {
                this.conditionalSeparator(writer, isAmbient);
                this.factory.forMethodDeclaration({ isAmbient }).printTexts(writer, structure.methods);
            }
        });
    }

    private printCtors(writer: CodeBlockWriter, structure: ClassDeclarationStructure, isAmbient: boolean) {
        if (ArrayUtils.isNullOrEmpty(structure.ctors))
            return;

        for (const ctor of structure.ctors) {
            this.conditionalSeparator(writer, isAmbient);
            this.factory.forConstructorDeclaration({ isAmbient }).printText(writer, ctor);
        }
    }

    private printGetAndSet(writer: CodeBlockWriter, structure: ClassDeclarationStructure, isAmbient: boolean) {
        const getAccessors = [...structure.getAccessors || []];
        const setAccessors = [...structure.setAccessors || []];
        const getAccessorWriter = this.factory.forGetAccessorDeclaration({ isAmbient });
        const setAccessorWriter = this.factory.forSetAccessorDeclaration({ isAmbient });

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
