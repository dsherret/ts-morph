import {VariableDeclarationKind} from "../../compiler/statement/VariableDeclarationKind";
import {VariableStatementStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {VariableDeclarationStructurePrinter} from "./VariableDeclarationStructurePrinter";
import {CommaSeparatedStructuresPrinter, NewLineFormattingStructuresPrinter} from "../formatting";

export class VariableStatementStructurePrinter extends StructurePrinter<VariableStatementStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly modifierWriter = new ModifierableNodeStructurePrinter(this.writer);
    private readonly declarationsWriter = new CommaSeparatedStructuresPrinter(this.writer, new VariableDeclarationStructurePrinter(this.writer));
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this.writer, this);

    printTexts(structures: VariableStatementStructure[] | undefined) {
        if (structures == null)
            return;
        this.multipleWriter.printText(structures);
    }

    printText(structure: VariableStatementStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.modifierWriter.printText(structure);
        this.writer.write(`${structure.declarationKind || VariableDeclarationKind.Let} `);
        this.declarationsWriter.printText(structure.declarations);
        this.writer.write(";");
    }
}
