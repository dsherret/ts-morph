import {ConstructSignatureDeclarationStructure} from "../../structures";
import {JSDocStructureToText} from "../doc";
import {TypeParameterDeclarationStructureToText} from "../types";
import {NewLineFormattingStructuresToText} from "../formatting";
import {ParameterDeclarationStructureToText} from "../function";
import {StructureToText} from "../StructureToText";

export class ConstructSignatureDeclarationStructureToText extends StructureToText<ConstructSignatureDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly typeParametersWriter = new TypeParameterDeclarationStructureToText(this.writer);
    private readonly parametersWriter = new ParameterDeclarationStructureToText(this.writer);
    private readonly multipleWriter = new NewLineFormattingStructuresToText(this.writer, this);

    writeTexts(structures: ConstructSignatureDeclarationStructure[] | undefined) {
        this.multipleWriter.writeText(structures);
    }

    writeText(structure: ConstructSignatureDeclarationStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.writer.write("new");
        this.typeParametersWriter.writeTexts(structure.typeParameters);
        this.writer.write("(");
        this.parametersWriter.writeTexts(structure.parameters);
        this.writer.write(")");
        if (structure.returnType != null && structure.returnType.length > 0)
            this.writer.write(`: ${structure.returnType}`);
        this.writer.write(";");
    }
}
