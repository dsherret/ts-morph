import CodeBlockWriter from "code-block-writer";
import {MethodDeclarationStructure, MethodDeclarationOverloadStructure} from "../../structures";
import {ObjectUtils, setValueIfUndefined} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {DecoratorStructurePrinter} from "../decorator";
import {ParameterDeclarationStructurePrinter} from "../function";
import {JSDocStructurePrinter} from "../doc";
import {BodyTextStructurePrinter} from "../statement";
import {TypeParameterDeclarationStructurePrinter} from "../types";

export class MethodDeclarationStructurePrinter extends StructurePrinter<MethodDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly modifierWriter = new ModifierableNodeStructurePrinter();
    private readonly decoratorWriter = new DecoratorStructurePrinter();
    private readonly parametersWriter = new ParameterDeclarationStructurePrinter();
    private readonly typeParametersWriter = new TypeParameterDeclarationStructurePrinter();
    private readonly bodyWriter = new BodyTextStructurePrinter(this.options);

    constructor(private readonly options: { isAmbient: boolean; }) {
        super();
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

        if (this.options.isAmbient)
            writer.write(";");
        else
            writer.spaceIfLastNot().inlineBlock(() => {
                this.bodyWriter.printText(writer, structure);
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
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.decoratorWriter.printTexts(writer, structure.decorators);
        this.modifierWriter.printText(writer, structure);
        writer.write(name);
        this.typeParametersWriter.printTexts(writer, structure.typeParameters);
        writer.write("(");
        this.parametersWriter.printTexts(writer, structure.parameters);
        writer.write(`)`);
        writer.conditionalWrite(structure.returnType != null && structure.returnType.length > 0, `: ${structure.returnType}`);
    }
}
