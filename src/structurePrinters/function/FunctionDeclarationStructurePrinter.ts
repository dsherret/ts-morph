import {FunctionDeclarationStructure, FunctionDeclarationOverloadStructure} from "../../structures";
import {StringUtils, setValueIfUndefined, ObjectUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {ParameterDeclarationStructurePrinter} from "./ParameterDeclarationStructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {CommaSeparatedStructuresPrinter} from "../formatting";
import {TypeParameterDeclarationStructurePrinter} from "../types";
import {BodyTextStructurePrinter} from "../statement";

export class FunctionDeclarationStructurePrinter extends StructurePrinter<FunctionDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructurePrinter(this.writer);
    private readonly typeParameterWriter = new TypeParameterDeclarationStructurePrinter(this.writer);
    private readonly parametersWriter = new CommaSeparatedStructuresPrinter(this.writer, new ParameterDeclarationStructurePrinter(this.writer));

    printTexts(structures: FunctionDeclarationStructure[] | undefined) {
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

            this.printText(currentStructure);
        }
    }

    printText(structure: FunctionDeclarationStructure) {
        this.printOverloads(structure.name, getOverloadStructures());
        this.printBase(structure.name, structure);
        if (structure.hasDeclareKeyword)
            this.writer.write(";");
        else
            this.writer.space().inlineBlock(() => {
                new BodyTextStructurePrinter(this.writer, { isAmbient: false }).printText(structure);
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

    private printOverloads(name: string, structures: FunctionDeclarationOverloadStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        for (const structure of structures) {
            this.printOverload(name, structure);
            this.writer.newLine();
        }
    }

    printOverload(name: string, structure: FunctionDeclarationOverloadStructure) {
        this.printBase(name, structure);
        this.writer.write(";");
    }

    private printBase(name: string, structure: FunctionDeclarationOverloadStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.modifierWriter.printText(structure);
        this.writer.write(`function`);
        this.writer.conditionalWrite(structure.isGenerator, "*");
        this.writer.write(` ${name}`);
        this.typeParameterWriter.printTexts(structure.typeParameters);
        this.writer.write("(");
        if (structure.parameters != null)
            this.parametersWriter.printText(structure.parameters);
        this.writer.write(`)`);
        if (!StringUtils.isNullOrWhitespace(structure.returnType))
            this.writer.write(`: ${structure.returnType}`);
    }
}
