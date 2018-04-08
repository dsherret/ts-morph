import CodeBlockWriter from "code-block-writer";
import {MethodDeclarationStructure, MethodDeclarationOverloadStructure} from "../../structures";
import {ObjectUtils, setValueIfUndefined} from "../../utils";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {DecoratorStructureToText} from "../decorator";
import {ParameterDeclarationStructureToText} from "../function";
import {JSDocStructureToText} from "../doc";
import {BodyTextStructureToText} from "../statement";
import {TypeParameterDeclarationStructureToText} from "../types";

export class MethodDeclarationStructureToText extends StructureToText<MethodDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly decoratorWriter = new DecoratorStructureToText(this.writer);
    private readonly parametersWriter = new ParameterDeclarationStructureToText(this.writer);
    private readonly typeParametersWriter = new TypeParameterDeclarationStructureToText(this.writer);
    private readonly bodyWriter = new BodyTextStructureToText(this.writer, this.options);

    constructor(writer: CodeBlockWriter, private readonly options: { isAmbient: boolean; }) {
        super(writer);
    }

    writeTexts(structures: MethodDeclarationStructure[] | undefined) {
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            if (i > 0) {
                if (this.options.isAmbient)
                    this.writer.newLine();
                else
                    this.writer.blankLine();
            }
            this.writeText(structures[i]);
        }
    }

    writeText(structure: MethodDeclarationStructure) {
        this.writeOverloads(structure.name, getOverloadStructures());
        this.writeBase(structure.name, structure);

        if (this.options.isAmbient)
            this.writer.write(";");
        else
            this.writer.spaceIfLastNot().inlineBlock(() => {
                this.bodyWriter.writeText(structure);
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

    private writeOverloads(name: string, structures: MethodDeclarationOverloadStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        for (const structure of structures) {
            this.writeOverload(name, structure);
            this.writer.newLine();
        }
    }

    writeOverload(name: string, structure: MethodDeclarationOverloadStructure) {
        this.writeBase(name, structure);
        this.writer.write(";");
    }

    private writeBase(name: string, structure: MethodDeclarationOverloadStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.decoratorWriter.writeTexts(structure.decorators);
        this.modifierWriter.writeText(structure);
        this.writer.write(name);
        this.typeParametersWriter.writeTexts(structure.typeParameters);
        this.writer.write("(");
        this.parametersWriter.writeTexts(structure.parameters);
        this.writer.write(`)`);
        this.writer.conditionalWrite(structure.returnType != null && structure.returnType.length > 0, `: ${structure.returnType}`);
    }
}
