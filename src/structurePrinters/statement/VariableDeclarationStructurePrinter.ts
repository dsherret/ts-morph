import CodeBlockWriter from "code-block-writer";
﻿import {VariableDeclarationStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";

export class VariableDeclarationStructurePrinter extends StructurePrinter<VariableDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructurePrinter();

    printText(writer: CodeBlockWriter, structure: VariableDeclarationStructure) {
        writer.write(structure.name);
        writer.conditionalWrite(structure.hasExclamationToken, "!");
        if (structure.type != null)
            writer.write(": " + structure.type);
        if (structure.initializer != null)
            writer.write(" = " + structure.initializer);
    }
}
