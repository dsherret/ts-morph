import CodeBlockWriter from "code-block-writer";
import {IndexSignatureDeclarationStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {ModifierableNodeStructurePrinter} from "../base";
import {JSDocStructurePrinter} from "../doc";

export class IndexSignatureDeclarationStructurePrinter extends StructurePrinter<IndexSignatureDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly modifierableWriter = new ModifierableNodeStructurePrinter();
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: IndexSignatureDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: IndexSignatureDeclarationStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.modifierableWriter.printText(writer, structure);
        writer.write(`[${structure.keyName || "key"}: ${structure.keyType || "string"}]: ${structure.returnType};`);
    }
}
