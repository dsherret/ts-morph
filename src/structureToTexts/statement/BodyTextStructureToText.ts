import CodeBlockWriter from "code-block-writer";
import {StatementedNodeStructure, BodiedNodeStructure, BodyableNodeStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {StructureToText} from "../StructureToText";
import {StatementedNodeStructureToText} from "./StatementedNodeStructureToText";

export type BodyTextStructures = StatementedNodeStructure | BodiedNodeStructure | BodyableNodeStructure;

export class BodyTextStructureToText extends StructureToText<BodyTextStructures> {
    private readonly statementWriter = new StatementedNodeStructureToText(this.writer, this.options);

    constructor(writer: CodeBlockWriter, private readonly options: { isAmbient: boolean; }) {
        super(writer);
    }

    writeText(structure: BodyTextStructures) {
        this.statementWriter.writeText(structure as StatementedNodeStructure);
        this.writer.conditionalBlankLine(!this.writer.isAtStartOfFirstLineOfBlock());
        this.writeTextOrWriterFunc((structure as BodyableNodeStructure).bodyText);
    }
}
