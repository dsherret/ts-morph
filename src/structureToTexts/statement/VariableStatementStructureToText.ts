import {VariableDeclarationType} from "../../compiler/statement/VariableDeclarationType";
import {VariableStatementStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {VariableDeclarationStructureToText} from "./VariableDeclarationStructureToText";
import {CommaSeparatedStructuresToText} from "../formatting";

export class VariableStatementStructureToText extends StructureToText<VariableStatementStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly declarationsWriter = new CommaSeparatedStructuresToText(this.writer, new VariableDeclarationStructureToText(this.writer));

    writeText(structure: VariableStatementStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`${structure.declarationType || VariableDeclarationType.Let} `);
        this.declarationsWriter.writeText(structure.declarations);
        this.writer.write(";");
    }
}
