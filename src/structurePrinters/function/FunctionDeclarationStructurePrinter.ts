import { CodeBlockWriter } from "../../codeBlockWriter";
import { FunctionDeclarationOverloadStructure, FunctionDeclarationStructure } from "../../structures";
import { StringUtils, ObjectUtils, setValueIfUndefined } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class FunctionDeclarationStructurePrinter extends FactoryStructurePrinter<FunctionDeclarationStructure> {
    printTexts(writer: CodeBlockWriter, structures: FunctionDeclarationStructure[] | undefined) {
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            const currentStructure = structures[i];
            if (i > 0) {
                const previousStructure = structures[i - 1];
                if (previousStructure.hasDeclareKeyword && currentStructure.hasDeclareKeyword)
                    writer.newLine();
                else
                    writer.blankLine();
            }

            this.printText(writer, currentStructure);
        }
    }

    printText(writer: CodeBlockWriter, structure: FunctionDeclarationStructure) {
        this.printOverloads(writer, structure.name, getOverloadStructures());
        this.printBase(writer, structure.name, structure);
        if (structure.hasDeclareKeyword)
            writer.write(";");
        else
            writer.space().inlineBlock(() => {
                this.factory.forBodyText({ isAmbient: false }).printText(writer, structure);
            });

        function getOverloadStructures() {
            // all the overloads need to have similar properties as the implementation
            const overloads = ObjectUtils.clone(structure.overloads);
            if (overloads == null || overloads.length === 0)
                return;

            for (const overload of overloads) {
                setValueIfUndefined(overload, "hasDeclareKeyword", structure.hasDeclareKeyword);
                setValueIfUndefined(overload, "isExported", structure.isExported);
                setValueIfUndefined(overload, "isDefaultExport", structure.isDefaultExport);
            }

            return overloads;
        }
    }

    private printOverloads(writer: CodeBlockWriter, name: string | undefined, structures: FunctionDeclarationOverloadStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        for (const structure of structures) {
            this.printOverload(writer, name, structure);
            writer.newLine();
        }
    }

    printOverload(writer: CodeBlockWriter, name: string | undefined, structure: FunctionDeclarationOverloadStructure) {
        this.printBase(writer, name, structure);
        writer.write(";");
    }

    private printBase(writer: CodeBlockWriter, name: string | undefined, structure: FunctionDeclarationOverloadStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(`function`);
        writer.conditionalWrite(structure.isGenerator, "*");
        if (!StringUtils.isNullOrWhitespace(name))
            writer.write(` ${name}`);
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        writer.write("(");
        if (structure.parameters != null)
            this.factory.forParameterDeclaration().printTexts(writer, structure.parameters);
        writer.write(`)`);
        this.factory.forReturnTypedNode().printText(writer, structure);
    }
}
