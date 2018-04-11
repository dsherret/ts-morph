import CodeBlockWriter from "code-block-writer";
import {StatementedNodeStructure, BodiedNodeStructure, BodyableNodeStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {StatementedNodeStructurePrinter} from "./StatementedNodeStructurePrinter";

export type BodyTextStructures = StatementedNodeStructure | { bodyText?: string; };

export class BodyTextStructurePrinter extends StructurePrinter<BodyTextStructures> {
    private readonly statementWriter = new StatementedNodeStructurePrinter(this.options);

    constructor(private readonly options: { isAmbient: boolean; }) {
        super();
    }

    printText(writer: CodeBlockWriter, structure: BodyTextStructures) {
        this.statementWriter.printText(writer, structure as StatementedNodeStructure);

        // todo: hacky, will need to change this in the future...
        // basically, need a way to make this only do the blank line if the user does a write
        const newWriter = new CodeBlockWriter(writer.getOptions());
        this.printTextOrWriterFunc(newWriter, (structure as BodyableNodeStructure).bodyText);
        if (newWriter.getLength() > 0) {
            if (!writer.isAtStartOfFirstLineOfBlock())
                writer.blankLineIfLastNot();
            writer.write(newWriter.toString());
        }
    }
}
