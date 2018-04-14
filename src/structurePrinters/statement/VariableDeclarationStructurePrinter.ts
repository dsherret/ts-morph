import CodeBlockWriter from "code-block-writer";
import { VariableDeclarationStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { CommaSeparatedStructuresPrinter } from "../formatting";

export class VariableDeclarationStructurePrinter extends FactoryStructurePrinter<VariableDeclarationStructure> {
    private readonly multipleWriter = new CommaSeparatedStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: VariableDeclarationStructure[]) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: VariableDeclarationStructure) {
        writer.write(structure.name);
        writer.conditionalWrite(structure.hasExclamationToken, "!");
        if (structure.type != null)
            writer.write(": " + structure.type);
        if (structure.initializer != null)
            writer.write(" = " + structure.initializer);
    }
}
