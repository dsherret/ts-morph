import CodeBlockWriter from "code-block-writer";
import {MethodDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";
import {ParameterDeclarationStructureToText} from "./../function";
import {JSDocStructureToText} from "./../doc";

export class MethodDeclarationStructureToText extends StructureToText<MethodDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructureToText(this.writer);
    private readonly parameterWriter = new ParameterDeclarationStructureToText(this.writer);

    constructor(writer: CodeBlockWriter, private readonly opts: { isAmbient: boolean; }) {
        super(writer);
    }

    writeText(structure: MethodDeclarationStructure) {
        this.jsDocWriter.writeDocs(structure.docs);
        this.writer.conditionalWrite(structure.isStatic, "static ");
        this.writer.write(`${structure.name}(`);
        this.parameterWriter.writeParameters(structure.parameters);
        this.writer.write(`)`);
        this.writer.conditionalWrite(structure.returnType != null && structure.returnType.length > 0, `: ${structure.returnType}`);

        if (this.opts.isAmbient)
            this.writer.write(";");
        else
            this.writer.block();
    }
}
