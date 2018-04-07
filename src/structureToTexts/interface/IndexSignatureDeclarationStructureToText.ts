import {IndexSignatureDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {JSDocStructureToText} from "../doc";

export class IndexSignatureDeclarationStructureToText extends StructureToText<IndexSignatureDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly modifierableWriter = new ModifierableNodeStructureToText(this.writer);

    writeTexts(structures: IndexSignatureDeclarationStructure[]) {
        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                this.writer.newLine();
            this.writeText(structures[i]);
        }
    }

    writeText(structure: IndexSignatureDeclarationStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.modifierableWriter.writeText(structure);
        this.writer.write(`[${structure.keyName || "key"}: ${structure.keyType || "string"}]: ${structure.returnType};`);
    }
}
