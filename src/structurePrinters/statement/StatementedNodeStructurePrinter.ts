import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { StatementedNodeStructure } from "../../structures";
import { Printer } from "../Printer";

export class StatementedNodeStructurePrinter extends Printer<StatementedNodeStructure> {
    constructor(private readonly factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super();
    }

    printText(writer: CodeBlockWriter, structure: StatementedNodeStructure) {
        this.factory.forStatement(this.options).printTexts(writer, structure.statements);
    }
}
