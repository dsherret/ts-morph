import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { MethodDeclarationOverloadStructure, MethodDeclarationStructure } from "../../structures";
import { ObjectUtils, setValueIfUndefined } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class MethodDeclarationStructurePrinter extends FactoryStructurePrinter<MethodDeclarationStructure> {
    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    printTexts(writer: CodeBlockWriter, structures: MethodDeclarationStructure[] | undefined) {
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            if (i > 0) {
                if (this.options.isAmbient)
                    writer.newLine();
                else
                    writer.blankLine();
            }
            this.printText(writer, structures[i]);
        }
    }

    printText(writer: CodeBlockWriter, structure: MethodDeclarationStructure) {
        this.printOverloads(writer, structure.name, getOverloadStructures());
        this.printBase(writer, structure.name, structure);

        if (this.options.isAmbient || structure.isAbstract)
            writer.write(";");
        else
            writer.spaceIfLastNot().inlineBlock(() => {
                this.factory.forBodyText(this.options).printText(writer, structure);
            });

        function getOverloadStructures() {
            // all the overloads need to have the same scope as the implementation
            const overloads = ObjectUtils.clone(structure.overloads);
            if (overloads == null || overloads.length === 0)
                return;

            for (const overload of overloads) {
                setValueIfUndefined(overload, "scope", structure.scope);
                setValueIfUndefined(overload, "isStatic", structure.isStatic); // allow people to do stupid things
                setValueIfUndefined(overload, "isAbstract", structure.isAbstract);
            }

            return overloads;
        }
    }

    private printOverloads(writer: CodeBlockWriter, name: string, structures: MethodDeclarationOverloadStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        for (const structure of structures) {
            this.printOverload(writer, name, structure);
            writer.newLine();
        }
    }

    printOverload(writer: CodeBlockWriter, name: string, structure: MethodDeclarationOverloadStructure) {
        this.printBase(writer, name, structure);
        writer.write(";");
    }

    private printBase(writer: CodeBlockWriter, name: string, structure: MethodDeclarationOverloadStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forDecorator().printTexts(writer, structure.decorators);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(name);
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        writer.write("(");
        this.factory.forParameterDeclaration().printTexts(writer, structure.parameters);
        writer.write(`)`);
        this.factory.forReturnTypedNode().printText(writer, structure);
    }
}
