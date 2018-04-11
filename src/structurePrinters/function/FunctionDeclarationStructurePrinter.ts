import CodeBlockWriter from "code-block-writer";
﻿import {FunctionDeclarationStructure, FunctionDeclarationOverloadStructure} from "../../structures";
import {StringUtils, setValueIfUndefined, ObjectUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {ParameterDeclarationStructurePrinter} from "./ParameterDeclarationStructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {TypeParameterDeclarationStructurePrinter} from "../types";
import {BodyTextStructurePrinter} from "../statement";

export class FunctionDeclarationStructurePrinter extends StructurePrinter<FunctionDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly modifierWriter = new ModifierableNodeStructurePrinter();
    private readonly typeParameterWriter = new TypeParameterDeclarationStructurePrinter();
    private readonly parametersWriter = new ParameterDeclarationStructurePrinter();

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
                new BodyTextStructurePrinter({ isAmbient: false }).printText(writer, structure);
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

    private printOverloads(writer: CodeBlockWriter, name: string, structures: FunctionDeclarationOverloadStructure[] | undefined) {
        if (structures == null || structures.length === 0)
            return;

        for (const structure of structures) {
            this.printOverload(writer, name, structure);
            writer.newLine();
        }
    }

    printOverload(writer: CodeBlockWriter, name: string, structure: FunctionDeclarationOverloadStructure) {
        this.printBase(writer, name, structure);
        writer.write(";");
    }

    private printBase(writer: CodeBlockWriter, name: string, structure: FunctionDeclarationOverloadStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.modifierWriter.printText(writer, structure);
        writer.write(`function`);
        writer.conditionalWrite(structure.isGenerator, "*");
        writer.write(` ${name}`);
        this.typeParameterWriter.printTexts(writer, structure.typeParameters);
        writer.write("(");
        if (structure.parameters != null)
            this.parametersWriter.printTexts(writer, structure.parameters);
        writer.write(`)`);
        if (!StringUtils.isNullOrWhitespace(structure.returnType))
            writer.write(`: ${structure.returnType}`);
    }
}
