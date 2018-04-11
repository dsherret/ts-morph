import CodeBlockWriter from "code-block-writer";
﻿import {MethodSignatureStructure} from "../../structures";
import {JSDocStructurePrinter} from "../doc";
import {TypeParameterDeclarationStructurePrinter} from "../types";
import {ParameterDeclarationStructurePrinter} from "../function";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {StructurePrinter} from "../StructurePrinter";

export class MethodSignatureStructurePrinter extends StructurePrinter<MethodSignatureStructure> {
    private readonly jsDocWriter = new JSDocStructurePrinter();
    private readonly typeParametersWriter = new TypeParameterDeclarationStructurePrinter();
    private readonly parametersWriter = new ParameterDeclarationStructurePrinter();
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: MethodSignatureStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: MethodSignatureStructure) {
        this.jsDocWriter.printDocs(writer, structure.docs);
        writer.write(structure.name);
        writer.conditionalWrite(structure.hasQuestionToken, "?");
        this.typeParametersWriter.printTexts(writer, structure.typeParameters);
        writer.write("(");
        this.parametersWriter.printTexts(writer, structure.parameters);
        writer.write(")");
        if (structure.returnType != null && structure.returnType.length > 0)
            writer.write(`: ${structure.returnType}`);
        writer.write(";");
    }
}
