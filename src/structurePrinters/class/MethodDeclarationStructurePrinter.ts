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
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructurePrinter(this.writer);
    private readonly decoratorWriter = new DecoratorStructurePrinter(this.writer);
    private readonly parametersWriter = new ParameterDeclarationStructurePrinter(this.writer);
    private readonly typeParametersWriter = new TypeParameterDeclarationStructurePrinter(this.writer);
    private readonly bodyWriter = new BodyTextStructurePrinter(this.writer, this.options);

    constructor(writer: CodeBlockWriter, private readonly options: { isAmbient: boolean; }) {
        super(writer);
    }

    printTexts(structures: MethodDeclarationStructure[] | undefined) {
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            if (i > 0) {
                if (this.options.isAmbient)
                    this.writer.newLine();
                else
                    this.writer.blankLine();
            }
            this.printText(structures[i]);
        }
    }

    printText(structure: MethodDeclarationStructure) {
        this.printOverloads(structure.name, getOverloadStructures());
        this.printBase(structure.name, structure);

        if (this.options.isAmbient)
            this.writer.write(";");
        else
            this.writer.spaceIfLastNot().inlineBlock(() => {
                this.bodyWriter.printText(structure);
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

    private printOverloads(name: string, structures: MethodDeclarationOverloadStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        for (const structure of structures) {
            this.printOverload(name, structure);
            this.writer.newLine();
        }
    }

    printOverload(name: string, structure: MethodDeclarationOverloadStructure) {
        this.printBase(name, structure);
        this.writer.write(";");
    }

    private printBase(name: string, structure: MethodDeclarationOverloadStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.decoratorWriter.printTexts(structure.decorators);
        this.modifierWriter.printText(structure);
        this.writer.write(name);
        this.typeParametersWriter.printTexts(structure.typeParameters);
        this.writer.write("(");
        this.parametersWriter.printTexts(structure.parameters);
        this.writer.write(`)`);
        this.writer.conditionalWrite(structure.returnType != null && structure.returnType.length > 0, `: ${structure.returnType}`);
    }
}
