import { CodeBlockWriter } from "../../../codeBlockWriter";
import { PropertyAssignmentStructure } from "../../../structures";
import { FactoryStructurePrinter } from "../../FactoryStructurePrinter";

export class PropertyAssignmentStructurePrinter extends FactoryStructurePrinter<PropertyAssignmentStructure> {
    printText(writer: CodeBlockWriter, structure: PropertyAssignmentStructure) {
        writer.write(`${structure.name}: `);
        if (typeof structure.initializer === "string")
            writer.write(structure.initializer);
        else
            structure.initializer(writer);
    }
}
