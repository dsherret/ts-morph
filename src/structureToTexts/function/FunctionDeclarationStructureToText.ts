import {FunctionDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";
import {ParameterDeclarationStructureToText} from "./ParameterDeclarationStructureToText";

export class FunctionDeclarationStructureToText extends StructureToText<FunctionDeclarationStructure> {
    private readonly parameterWriter = new ParameterDeclarationStructureToText(this.writer);

    writeText(structure: FunctionDeclarationStructure) {
        this.writer.conditionalWrite(structure.hasDeclareKeyword, "declare ");
        this.writer.write(`function ${structure.name}(`);
        if (structure.parameters != null)
            this.parameterWriter.writeParameters(structure.parameters);
        this.writer.write(`)`);
        if (structure.hasDeclareKeyword)
            this.writer.write(";");
        else
            this.writer.block();
    }
}
