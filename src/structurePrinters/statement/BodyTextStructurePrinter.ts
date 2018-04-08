import CodeBlockWriter from "code-block-writer";
import {StatementedNodeStructure, BodiedNodeStructure, BodyableNodeStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {StatementedNodeStructurePrinter} from "./StatementedNodeStructurePrinter";

export type BodyTextStructures = StatementedNodeStructure | { bodyText?: string; };

export class BodyTextStructurePrinter extends StructurePrinter<BodyTextStructures> {
    private readonly statementWriter = new StatementedNodeStructurePrinter(this.writer, this.options);

    constructor(writer: CodeBlockWriter, private readonly options: { isAmbient: boolean; }) {
        super(writer);
    }

    printText(structure: BodyTextStructures) {
        this.statementWriter.printText(structure as StatementedNodeStructure);

        // todo: hacky, will need to change this in the future...
        // basically, need a way to make this only do the blank line if the user does a write
        const newWriter = new CodeBlockWriter(this.writer.getOptions());
        this.printTextOrWriterFunc((structure as BodyableNodeStructure).bodyText, newWriter);
        if (newWriter.getLength() > 0) {
            this.writer.blankLineIfLastNot();
            this.writer.write(newWriter.toString());
        }
    }
}
