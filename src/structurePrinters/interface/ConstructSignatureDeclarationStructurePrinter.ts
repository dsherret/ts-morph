import CodeBlockWriter from "code-block-writer";
import {ConstructSignatureDeclarationStructure} from "../../structures";
import {JSDocStructurePrinter} from "../doc";
import {TypeParameterDeclarationStructurePrinter} from "../types";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {ParameterDeclarationStructurePrinter} from "../function";
import {StructurePrinter} from "../StructurePrinter";

export class ConstructSignatureDeclarationStructurePrinter extends StructurePrinter<ConstructSignatureDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly typeParametersWriter = new TypeParameterDeclarationStructurePrinter();
    private readonly parametersWriter = new ParameterDeclarationStructurePrinter();
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ConstructSignatureDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: ConstructSignatureDeclarationStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        writer.write("new");
        this.typeParametersWriter.printTextsWithBrackets(writer, structure.typeParameters);
        writer.write("(");
        this.parametersWriter.printTexts(writer, structure.parameters);
        writer.write(")");
        if (structure.returnType != null && structure.returnType.length > 0)
            writer.write(`: ${structure.returnType}`);
        writer.write(";");
    }
}
