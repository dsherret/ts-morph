import {VariableDeclarationType} from "../../compiler/statement/VariableDeclarationType";
import {VariableStatementStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";

export class VariableStatementStructureToText extends StructureToText<VariableStatementStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);

    writeText(structure: VariableStatementStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`${structure.declarationType || VariableDeclarationType.Let} `);
        for (let i = 0; i < structure.declarations.length; i++) {
            const declarationStructure = structure.declarations[i];

            this.writer.conditionalWrite(i > 0, ", ");
            this.writer.write(declarationStructure.name);
            if (declarationStructure.type != null)
                this.writer.write(": " + declarationStructure.type);
            if (declarationStructure.initializer != null)
                this.writer.write(" = " + declarationStructure.initializer);
        }
        this.writer.write(";");
    }
}
