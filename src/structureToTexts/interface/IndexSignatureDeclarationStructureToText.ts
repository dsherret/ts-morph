import { IndexSignatureDeclarationStructure } from "../../structures";
import { StructureToText } from "../StructureToText";

export class IndexSignatureDeclarationStructureToText extends StructureToText<IndexSignatureDeclarationStructure> {
    writeTexts(structures: IndexSignatureDeclarationStructure[]) {
        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                this.writer.newLine();
            this.writeText(structures[i]);
        }
    }

    writeText(structure: IndexSignatureDeclarationStructure) {
        this.writer.write(`[${structure.keyName || "key"}: ${structure.keyType || "string"}]: ${structure.returnType};`);
    }
}
