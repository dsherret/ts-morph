import { IndexSignatureDeclarationStructure } from "./../../structures";
import { StructureToText } from "./../StructureToText";

export class IndexSignatureDeclarationStructureToText extends StructureToText<IndexSignatureDeclarationStructure> {
    writeText(structure: IndexSignatureDeclarationStructure) {
        this.writer.write(`[${structure.keyName || "key"}: ${structure.keyType || "string"}]: ${structure.returnType};`);
    }
}
