import CodeBlockWriter from "code-block-writer";
import {StatementedNodeStructure, BodiedNodeStructure, BodyableNodeStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {StructureToText} from "../StructureToText";
import {StatementedNodeStructureToText} from "./StatementedNodeStructureToText";

export type BodyTextStructures = StatementedNodeStructure | { bodyText?: string; };

export class BodyTextStructureToText extends StructureToText<BodyTextStructures> {
    private readonly statementWriter = new StatementedNodeStructureToText(this.writer, this.options);

    constructor(writer: CodeBlockWriter, private readonly options: { isAmbient: boolean; }) {
        super(writer);
    }

    writeText(structure: BodyTextStructures) {
        this.statementWriter.writeText(structure as StatementedNodeStructure);

        // todo: hacky, will need to change this in the future...
        // basically, need a way to make this only do the blank line if the user does a write
        const newWriter = new CodeBlockWriter(this.writer.getOptions());
        this.writeTextOrWriterFunc((structure as BodyableNodeStructure).bodyText, newWriter);
        if (newWriter.getLength() > 0) {
            this.writer.blankLineIfLastNot();
            this.writer.write(newWriter.toString());
        }
    }
}
