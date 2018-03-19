import {MethodSignatureStructure} from "../../structures";
import {StructureToText} from "../StructureToText";

export class MethodSignatureStructureToText extends StructureToText<MethodSignatureStructure> {
    writeText(structure: MethodSignatureStructure) {
        this.writer.write(structure.name);
        this.writer.conditionalWrite(structure.hasQuestionToken, "?");
        this.writer.write("()");
        if (structure.returnType != null && structure.returnType.length > 0)
            this.writer.write(`: ${structure.returnType}`);
        this.writer.write(";");
    }
}
