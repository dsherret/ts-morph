import {CallSignatureDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";

export class CallSignatureDeclarationStructureToText extends StructureToText<CallSignatureDeclarationStructure> {
    writeTexts(structures: CallSignatureDeclarationStructure[]) {
        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                this.writer.newLine();
            this.writeText(structures[i]);
        }
    }

    writeText(structure: CallSignatureDeclarationStructure) {
        this.writer.write("()");
        this.writer.write(`: ${structure.returnType || "void"}`);
        this.writer.write(";");
    }
}
