import { ArrayUtils, StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { ClassDeclarationStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { BlankLineFormattingStructuresPrinter } from "../formatting";

export class ClassDeclarationStructurePrinter extends NodePrinter<OptionalKind<ClassDeclarationStructure>> {
    private readonly multipleWriter = new BlankLineFormattingStructuresPrinter(this);

    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ClassDeclarationStructure>> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ClassDeclarationStructure>) {
        const isAmbient = structure.hasDeclareKeyword || this.options.isAmbient;
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forDecorator().printTexts(writer, structure.decorators);
        this.printHeader(writer, structure);

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

    private printHeader(writer: CodeBlockWriter, structure: OptionalKind<ClassDeclarationStructure>) {
        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(`class`);
        // can be null, ex. `export default class { ... }`
        if (!StringUtils.isNullOrWhitespace(structure.name))
            writer.space().write(structure.name);
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        writer.space();

        writer.hangingIndent(() => {
            if (structure.extends != null) {
                const extendsText = this.getText(writer, structure.extends);
                if (!StringUtils.isNullOrWhitespace(extendsText))
                    writer.write(`extends ${extendsText} `);
            }

            if (structure.implements != null) {
                const implementsText = structure.implements instanceof Array
                    ? structure.implements.map(i => this.getText(writer, i)).join(", ")
                    : this.getText(writer, structure.implements);

                if (!StringUtils.isNullOrWhitespace(implementsText))
                    writer.write(`implements ${implementsText} `);
            }
        });
    }

    private printCtors(writer: CodeBlockWriter, structure: OptionalKind<ClassDeclarationStructure>, isAmbient: boolean) {
        if (ArrayUtils.isNullOrEmpty(structure.ctors))
            return;

        for (const ctor of structure.ctors) {
            this.conditionalSeparator(writer, isAmbient);
            this.factory.forConstructorDeclaration({ isAmbient }).printText(writer, ctor);
        }
    }

    private printGetAndSet(writer: CodeBlockWriter, structure: OptionalKind<ClassDeclarationStructure>, isAmbient: boolean) {
        const getAccessors = [...structure.getAccessors ?? []];
        const setAccessors = [...structure.setAccessors ?? []];
        const getAccessorWriter = this.factory.forGetAccessorDeclaration({ isAmbient });
        const setAccessorWriter = this.factory.forSetAccessorDeclaration({ isAmbient });

        for (const getAccessor of getAccessors) {
            this.conditionalSeparator(writer, isAmbient);
            getAccessorWriter.printText(writer, getAccessor);

            // write the corresponding set accessor beside the get accessor
            const setAccessorIndex = setAccessors.findIndex(item => item.name === getAccessor.name);
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
