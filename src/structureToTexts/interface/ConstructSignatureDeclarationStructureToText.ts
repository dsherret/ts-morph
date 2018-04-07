import {ConstructSignatureDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";

export class ConstructSignatureDeclarationStructureToText extends StructureToText<ConstructSignatureDeclarationStructure> {
    writeTexts(structures: ConstructSignatureDeclarationStructure[]) {
        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                this.writer.newLine();
            this.writeText(structures[i]);
        }
    }

    writeText(structure: ConstructSignatureDeclarationStructure) {
        this.writer.write("new()");
        if (structure.returnType != null && structure.returnType.length > 0)
            this.writer.write(`: ${structure.returnType}`);
        this.writer.write(";");
    }
}
