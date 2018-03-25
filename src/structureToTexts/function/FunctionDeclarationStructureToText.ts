import {FunctionDeclarationStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {ParameterDeclarationStructureToText} from "./ParameterDeclarationStructureToText";
import {ModifierableNodeStructureToText} from "../base";
import {CommaSeparatedStructuresToText} from "../formatting";

export class FunctionDeclarationStructureToText extends StructureToText<FunctionDeclarationStructure> {
    private readonly modifierWriter = new ModifierableNodeStructureToText(this.writer);
    private readonly parametersWriter = new CommaSeparatedStructuresToText(this.writer, new ParameterDeclarationStructureToText(this.writer));

    writeText(structure: FunctionDeclarationStructure) {
        this.modifierWriter.writeText(structure);
        this.writer.write(`function ${structure.name}(`);
        if (structure.parameters != null)
            this.parametersWriter.writeText(structure.parameters);
        this.writer.write(`)`);
        if (structure.hasDeclareKeyword)
            this.writer.write(";");
        else
            this.writer.block();
    }
}
