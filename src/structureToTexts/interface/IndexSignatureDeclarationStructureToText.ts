import {IndexSignatureDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {NewLineFormattingStructuresToText} from "../formatting";
import {ModifierableNodeStructureToText} from "../base";
import {JSDocStructureToText} from "../doc";

export class IndexSignatureDeclarationStructureToText extends StructureToText<IndexSignatureDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly modifierableWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly multipleWriter = new NewLineFormattingStructuresToText(this.writer, this);

    writeTexts(structures: IndexSignatureDeclarationStructure[] | undefined) {
        this.multipleWriter.writeText(structures);
    }

    writeText(structure: IndexSignatureDeclarationStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.modifierableWriter.writeText(structure);
        this.writer.write(`[${structure.keyName || "key"}: ${structure.keyType || "string"}]: ${structure.returnType};`);
    }
}
