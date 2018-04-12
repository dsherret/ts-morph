import CodeBlockWriter from "code-block-writer";
import {VariableDeclarationKind} from "../../compiler/statement/VariableDeclarationKind";
import {VariableStatementStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";
import {VariableDeclarationStructurePrinter} from "./VariableDeclarationStructurePrinter";
import {CommaSeparatedStructuresPrinter, NewLineFormattingStructuresPrinter} from "../formatting";

export class VariableStatementStructurePrinter extends StructurePrinter<VariableStatementStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly modifierWriter = new ModifierableNodeStructurePrinter();
    private readonly declarationsWriter = new CommaSeparatedStructuresPrinter(new VariableDeclarationStructurePrinter());
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: VariableStatementStructure[] | undefined) {
        if (structures == null)
            return;
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: VariableStatementStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.modifierWriter.printText(writer, structure);
        writer.write(`${structure.declarationKind || VariableDeclarationKind.Let} `);
        this.declarationsWriter.printText(writer, structure.declarations);
        writer.write(";");
    }
}
