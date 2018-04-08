import {CallSignatureDeclarationStructure} from "../../structures";
import {JSDocStructurePrinter} from "../doc";
import {TypeParameterDeclarationStructurePrinter} from "../types";
import {ParameterDeclarationStructurePrinter} from "../function";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {StructurePrinter} from "../StructurePrinter";

export class CallSignatureDeclarationStructurePrinter extends StructurePrinter<CallSignatureDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);
    private readonly typeParametersWriter = new TypeParameterDeclarationStructurePrinter(this.writer);
    private readonly parametersWriter = new ParameterDeclarationStructurePrinter(this.writer);
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this.writer, this);

    printTexts(structures: CallSignatureDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(structures);
    }

    printText(structure: CallSignatureDeclarationStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.typeParametersWriter.printTexts(structure.typeParameters);
        this.writer.write("(");
        this.parametersWriter.printTexts(structure.parameters);
        this.writer.write(")");
        this.writer.write(`: ${structure.returnType || "void"}`);
        this.writer.write(";");
    }
}
