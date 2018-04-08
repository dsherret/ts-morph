import {ConstructSignatureDeclarationStructure} from "../../structures";
import {JSDocStructurePrinter} from "../doc";
import {TypeParameterDeclarationStructurePrinter} from "../types";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {ParameterDeclarationStructurePrinter} from "../function";
import {StructurePrinter} from "../StructurePrinter";

export class ConstructSignatureDeclarationStructurePrinter extends StructurePrinter<ConstructSignatureDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly typeParametersWriter = new TypeParameterDeclarationStructurePrinter(this.writer);
    private readonly parametersWriter = new ParameterDeclarationStructurePrinter(this.writer);
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this.writer, this);

    printTexts(structures: ConstructSignatureDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(structures);
    }

    printText(structure: ConstructSignatureDeclarationStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.writer.write("new");
        this.typeParametersWriter.printTexts(structure.typeParameters);
        this.writer.write("(");
        this.parametersWriter.printTexts(structure.parameters);
        this.writer.write(")");
        if (structure.returnType != null && structure.returnType.length > 0)
            this.writer.write(`: ${structure.returnType}`);
        this.writer.write(";");
    }
}
