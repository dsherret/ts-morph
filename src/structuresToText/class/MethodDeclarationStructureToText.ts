import CodeBlockWriter from "code-block-writer";
import {MethodDeclarationStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class MethodDeclarationStructureToText extends StructureToText<MethodDeclarationStructure> {
    constructor(writer: CodeBlockWriter, private readonly opts: { isAmbient: boolean; }) {
        super(writer);
    }

    writeText(structure: MethodDeclarationStructure) {
        this.writer.conditionalWrite(structure.isStatic, "static ");
        this.writer.write(`${structure.name}()`);
        this.writer.conditionalWrite(structure.returnType != null && structure.returnType.length > 0, `: ${structure.returnType}`);

        if (this.opts.isAmbient)
            this.writer.write(";");
        else
            this.writer.block();
    }
}
