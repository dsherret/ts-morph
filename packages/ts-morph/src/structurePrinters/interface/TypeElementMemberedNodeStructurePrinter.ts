import { ArrayUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { TypeElementMemberedNodeStructure } from "../../structures";
import { StructurePrinterFactory } from "../../factories";
import { Printer } from "../Printer";

export class TypeElementMemberedNodeStructurePrinter extends Printer<TypeElementMemberedNodeStructure> {
    constructor(private readonly factory: StructurePrinterFactory) {
        super();
    }

    printText(writer: CodeBlockWriter, structure: TypeElementMemberedNodeStructure) {
        this.factory.forCallSignatureDeclaration().printTexts(writer, structure.callSignatures);

        this.conditionalSeparator(writer, structure.constructSignatures);
        this.factory.forConstructSignatureDeclaration().printTexts(writer, structure.constructSignatures);

        this.conditionalSeparator(writer, structure.indexSignatures);
        this.factory.forIndexSignatureDeclaration().printTexts(writer, structure.indexSignatures);

        this.conditionalSeparator(writer, structure.properties);
        this.factory.forPropertySignature().printTexts(writer, structure.properties);

        this.conditionalSeparator(writer, structure.methods);
        this.factory.forMethodSignature().printTexts(writer, structure.methods);
    }

    private conditionalSeparator(writer: CodeBlockWriter, structures: ReadonlyArray<any> | undefined) {
        if (!ArrayUtils.isNullOrEmpty(structures) && !writer.isAtStartOfFirstLineOfBlock())
            writer.newLine();
    }
}
