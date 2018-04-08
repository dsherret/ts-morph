import {VariableDeclarationKind} from "../../compiler/statement/VariableDeclarationKind";
import {VariableStatementStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {JSDocStructureToText} from "../doc";
import {VariableDeclarationStructureToText} from "./VariableDeclarationStructureToText";
import {CommaSeparatedStructuresToText, NewLineFormattingStructuresToText} from "../formatting";

export class VariableStatementStructureToText extends StructureToText<VariableStatementStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly declarationsWriter = new CommaSeparatedStructuresToText(this.writer, new VariableDeclarationStructureToText(this.writer));
    private readonly multipleWriter = new NewLineFormattingStructuresToText(this.writer, this);

    writeTexts(structures: VariableStatementStructure[] | undefined) {
        if (structures == null)
            return;
        this.multipleWriter.writeText(structures);
    }

    writeText(structure: VariableStatementStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.modifierWriter.writeText(structure);
        this.writer.write(`${structure.declarationKind || VariableDeclarationKind.Let} `);
        this.declarationsWriter.writeText(structure.declarations);
        this.writer.write(";");
    }
}
