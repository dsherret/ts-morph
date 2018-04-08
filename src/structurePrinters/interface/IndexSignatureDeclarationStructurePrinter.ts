import {IndexSignatureDeclarationStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";

export class IndexSignatureDeclarationStructurePrinter extends StructurePrinter<IndexSignatureDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly modifierableWriter = new ModifierableNodeStructurePrinter(this.writer);
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this.writer, this);

    printTexts(structures: IndexSignatureDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(structures);
    }

    printText(structure: IndexSignatureDeclarationStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.modifierableWriter.printText(structure);
        this.writer.write(`[${structure.keyName || "key"}: ${structure.keyType || "string"}]: ${structure.returnType};`);
    }
}
