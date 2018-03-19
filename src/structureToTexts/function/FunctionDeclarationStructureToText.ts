import {FunctionDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ParameterDeclarationStructureToText} from "./ParameterDeclarationStructureToText";
import {ModifierableNodeStructureToText} from "../base";

export class FunctionDeclarationStructureToText extends StructureToText<FunctionDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly parameterWriter = new ParameterDeclarationStructureToText(this.writer);

    writeText(structure: FunctionDeclarationStructure) {
        this.modifierWriter.writeText(structure);
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
