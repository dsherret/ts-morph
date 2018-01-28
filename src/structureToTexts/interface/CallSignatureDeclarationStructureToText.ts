import {CallSignatureDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class CallSignatureDeclarationStructureToText extends StructureToText<CallSignatureDeclarationStructure> {
    writeText(structure: CallSignatureDeclarationStructure) {
        this.writer.write("()");
        this.writer.write(`: ${structure.returnType || "void"}`);
        this.writer.write(";");
    }
}
