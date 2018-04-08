import {FunctionDeclarationStructure, FunctionDeclarationOverloadStructure} from "../../structures";
import {StringUtils, setValueIfUndefined, ObjectUtils} from "../../utils";
import {StructureToText} from "../StructureToText";
import {ParameterDeclarationStructureToText} from "./ParameterDeclarationStructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {JSDocStructureToText} from "../doc";
import {CommaSeparatedStructuresToText} from "../formatting";
import {TypeParameterDeclarationStructureToText} from "../types";
import {BodyTextStructureToText} from "../statement";

export class FunctionDeclarationStructureToText extends StructureToText<FunctionDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly typeParameterWriter = new TypeParameterDeclarationStructureToText(this.writer);
    private readonly parametersWriter = new CommaSeparatedStructuresToText(this.writer, new ParameterDeclarationStructureToText(this.writer));

    writeTexts(structures: FunctionDeclarationStructure[] | undefined) {
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            const currentStructure = structures[i];
            if (i > 0) {
                const previousStructure = structures[i - 1];
                if (previousStructure.hasDeclareKeyword && currentStructure.hasDeclareKeyword)
                    this.writer.newLine();
                else
                    this.writer.blankLine();
            }

            this.writeText(currentStructure);
        }
    }

    writeText(structure: FunctionDeclarationStructure) {
        this.writeOverloads(structure.name, getOverloadStructures());
        this.writeBase(structure.name, structure);
        if (structure.hasDeclareKeyword)
            this.writer.write(";");
        else
            this.writer.space().inlineBlock(() => {
                new BodyTextStructureToText(this.writer, { isAmbient: false }).writeText(structure);
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

    private writeOverloads(name: string, structures: FunctionDeclarationOverloadStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        for (const structure of structures) {
            this.writeOverload(name, structure);
            this.writer.newLine();
        }
    }

    writeOverload(name: string, structure: FunctionDeclarationOverloadStructure) {
        this.writeBase(name, structure);
        this.writer.write(";");
    }

    private writeBase(name: string, structure: FunctionDeclarationOverloadStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.modifierWriter.writeText(structure);
        this.writer.write(`function`);
        this.writer.conditionalWrite(structure.isGenerator, "*");
        this.writer.write(` ${name}`);
        this.typeParameterWriter.writeTexts(structure.typeParameters);
        this.writer.write("(");
        if (structure.parameters != null)
            this.parametersWriter.writeText(structure.parameters);
        this.writer.write(`)`);
        if (!StringUtils.isNullOrWhitespace(structure.returnType))
            this.writer.write(`: ${structure.returnType}`);
    }
}
