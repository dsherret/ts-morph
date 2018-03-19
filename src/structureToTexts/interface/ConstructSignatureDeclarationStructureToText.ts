import {ConstructSignatureDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";

export class ConstructSignatureDeclarationStructureToText extends StructureToText<ConstructSignatureDeclarationStructure> {
    writeText(structure: ConstructSignatureDeclarationStructure) {
        this.writer.write("new()");
        if (structure.returnType != null && structure.returnType.length > 0)
            this.writer.write(`: ${structure.returnType}`);
        this.writer.write(";");
    }
}
