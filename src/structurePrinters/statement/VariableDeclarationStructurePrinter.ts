import {VariableDeclarationStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";

export class VariableDeclarationStructurePrinter extends StructurePrinter<VariableDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructurePrinter(this.writer);

    printText(structure: VariableDeclarationStructure) {
        this.writer.write(structure.name);
        this.writer.conditionalWrite(structure.hasExclamationToken, "!");
        if (structure.type != null)
            this.writer.write(": " + structure.type);
        if (structure.initializer != null)
            this.writer.write(" = " + structure.initializer);
    }
}
