import {FunctionDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";
import {ParameterDeclarationStructureToText} from "./ParameterDeclarationStructureToText";

export class FunctionDeclarationStructureToText extends StructureToText<FunctionDeclarationStructure> {
    private readonly parameterWriter = new ParameterDeclarationStructureToText(this.writer);

    writeText(structure: FunctionDeclarationStructure) {
        this.writer.write(`function ${structure.name}(`);
        if (structure.parameters != null)
            this.parameterWriter.writeParameters(structure.parameters);
        this.writer.write(`)`).block();
    }
}
