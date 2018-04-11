import CodeBlockWriter from "code-block-writer";
﻿import {CallSignatureDeclarationStructure} from "../../structures";
import {JSDocStructurePrinter} from "../doc";
import {TypeParameterDeclarationStructurePrinter} from "../types";
import {ParameterDeclarationStructurePrinter} from "../function";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {StructurePrinter} from "../StructurePrinter";

export class CallSignatureDeclarationStructurePrinter extends StructurePrinter<CallSignatureDeclarationStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly typeParametersWriter = new TypeParameterDeclarationStructurePrinter();
    private readonly parametersWriter = new ParameterDeclarationStructurePrinter();
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: CallSignatureDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: CallSignatureDeclarationStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        this.typeParametersWriter.printTexts(writer, structure.typeParameters);
        writer.write("(");
        this.parametersWriter.printTexts(writer, structure.parameters);
        writer.write(")");
        writer.write(`: ${structure.returnType || "void"}`);
        writer.write(";");
    }
}
