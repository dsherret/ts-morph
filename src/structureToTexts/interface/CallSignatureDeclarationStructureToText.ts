import {CallSignatureDeclarationStructure} from "../../structures";
import {JSDocStructureToText} from "../doc";
import {TypeParameterDeclarationStructureToText} from "../types";
import {ParameterDeclarationStructureToText} from "../function";
import {StructureToText} from "../StructureToText";

export class CallSignatureDeclarationStructureToText extends StructureToText<CallSignatureDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly typeParametersWriter = new TypeParameterDeclarationStructureToText(this.writer);
    private readonly parametersWriter = new ParameterDeclarationStructureToText(this.writer);

    writeTexts(structures: CallSignatureDeclarationStructure[]) {
        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                this.writer.newLine();
            this.writeText(structures[i]);
        }
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
