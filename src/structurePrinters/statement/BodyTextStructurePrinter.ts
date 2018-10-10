﻿import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { BodyableNodeStructure, StatementedNodeStructure } from "../../structures";
import { WriterFunction } from "../../types";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export type BodyTextStructures = StatementedNodeStructure | { bodyText?: string | WriterFunction; };

export class BodyTextStructurePrinter extends FactoryStructurePrinter<BodyTextStructures> {
    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    printText(writer: CodeBlockWriter, structure: BodyTextStructures) {
        this.factory.forStatementedNode(this.options).printText(writer, structure as StatementedNodeStructure);

        const newWriter = this.getNewWriter(writer);
        this.printTextOrWriterFunc(newWriter, (structure as BodyableNodeStructure).bodyText);
        if (newWriter.getLength() > 0) {
            if (!writer.isAtStartOfFirstLineOfBlock())
                writer.blankLineIfLastNot();
            writer.write(newWriter.toString());
        }
    }
}
