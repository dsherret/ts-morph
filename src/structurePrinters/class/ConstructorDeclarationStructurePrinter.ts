import { CodeBlockWriter } from "../../codeBlockWriter";
import { ConstructorDeclarationStructure, ConstructorDeclarationOverloadStructure } from "../../structures";
import { ObjectUtils, setValueIfUndefined } from "../../utils";
import { StructurePrinterFactory } from "../../factories";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class ConstructorDeclarationStructurePrinter extends FactoryStructurePrinter<ConstructorDeclarationStructure> {
    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    printText(writer: CodeBlockWriter, structure: ConstructorDeclarationStructure) {
        this.printOverloads(writer, getOverloadStructures());
        this.printBase(writer, structure);
        if (this.options.isAmbient)
            writer.write(";");
        else
            writer.space().inlineBlock(() => {
                this.factory.forBodyText(this.options).printText(writer, structure);
            });

        function getOverloadStructures() {
            // all the overloads need to have the same scope as the implementation
            const overloads = ObjectUtils.clone(structure.overloads);
            if (overloads == null || overloads.length === 0)
                return;

            for (const overload of overloads)
                setValueIfUndefined(overload, "scope", structure.scope);

            return overloads;
        }
    }

    private printOverloads(writer: CodeBlockWriter, structures: ConstructorDeclarationOverloadStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        for (const structure of structures) {
            this.printOverload(writer, structure);
            writer.newLine();
        }
    }

    printOverload(writer: CodeBlockWriter, structure: ConstructorDeclarationOverloadStructure) {
        this.printBase(writer, structure);
        writer.write(";");
    }

    private printBase(writer: CodeBlockWriter, structure: ConstructorDeclarationOverloadStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.write("constructor");
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        writer.write("(");
        this.factory.forParameterDeclaration().printTexts(writer, structure.parameters);
        writer.write(")");
    }
}
