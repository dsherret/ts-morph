import {CallSignatureDeclarationStructure} from "../../structures";
import {JSDocStructureToText} from "../doc";
import {TypeParameterDeclarationStructureToText} from "../types";
import {ParameterDeclarationStructureToText} from "../function";
import {NewLineFormattingStructuresToText} from "../formatting";
import {StructureToText} from "../StructureToText";

export class CallSignatureDeclarationStructureToText extends StructureToText<CallSignatureDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly typeParametersWriter = new TypeParameterDeclarationStructureToText(this.writer);
    private readonly parametersWriter = new ParameterDeclarationStructureToText(this.writer);
    private readonly multipleWriter = new NewLineFormattingStructuresToText(this.writer, this);

    writeTexts(structures: CallSignatureDeclarationStructure[] | undefined) {
        this.multipleWriter.writeText(structures);
    }

    writeText(structure: CallSignatureDeclarationStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.typeParametersWriter.writeTexts(structure.typeParameters);
        this.writer.write("(");
        this.parametersWriter.writeTexts(structure.parameters);
        this.writer.write(")");
        this.writer.write(`: ${structure.returnType || "void"}`);
        this.writer.write(";");
    }
}
