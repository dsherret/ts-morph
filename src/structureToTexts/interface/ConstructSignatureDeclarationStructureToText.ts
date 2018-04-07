import {ConstructSignatureDeclarationStructure} from "../../structures";
import {JSDocStructureToText} from "../doc";
import {TypeParameterDeclarationStructureToText} from "../types";
import {ParameterDeclarationStructureToText} from "../function";
import {StructureToText} from "../StructureToText";

export class ConstructSignatureDeclarationStructureToText extends StructureToText<ConstructSignatureDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly typeParametersWriter = new TypeParameterDeclarationStructureToText(this.writer);
    private readonly parametersWriter = new ParameterDeclarationStructureToText(this.writer);

    writeTexts(structures: ConstructSignatureDeclarationStructure[]) {
        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                this.writer.newLine();
            this.writeText(structures[i]);
        }
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
