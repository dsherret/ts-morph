import {MethodSignatureStructure} from "../../structures";
import {JSDocStructureToText} from "../doc";
import {TypeParameterDeclarationStructureToText} from "../types";
import {ParameterDeclarationStructureToText} from "../function";
import {NewLineFormattingStructuresToText} from "../formatting";
import {StructureToText} from "../StructureToText";

export class MethodSignatureStructureToText extends StructureToText<MethodSignatureStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly typeParametersWriter = new TypeParameterDeclarationStructureToText(this.writer);
    private readonly parametersWriter = new ParameterDeclarationStructureToText(this.writer);
    private readonly multipleWriter = new NewLineFormattingStructuresToText(this.writer, this);

    writeTexts(structures: MethodSignatureStructure[] | undefined) {
        this.multipleWriter.writeText(structures);
    }

    writeText(structure: MethodSignatureStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.writer.write(structure.name);
        this.writer.conditionalWrite(structure.hasQuestionToken, "?");
        this.typeParametersWriter.writeTexts(structure.typeParameters);
        this.writer.write("(");
        this.parametersWriter.writeTexts(structure.parameters);
        this.writer.write(")");
        if (structure.returnType != null && structure.returnType.length > 0)
            this.writer.write(`: ${structure.returnType}`);
        this.writer.write(";");
    }
}
