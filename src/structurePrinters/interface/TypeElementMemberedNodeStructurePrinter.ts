import CodeBlockWriter from "code-block-writer";
﻿import {TypeElementMemberedNodeStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {CallSignatureDeclarationStructurePrinter} from "./CallSignatureDeclarationStructurePrinter";
import {ConstructSignatureDeclarationStructurePrinter} from "./ConstructSignatureDeclarationStructurePrinter";
import {IndexSignatureDeclarationStructurePrinter} from "./IndexSignatureDeclarationStructurePrinter";
import {MethodSignatureStructurePrinter} from "./MethodSignatureStructurePrinter";
import {PropertySignatureStructurePrinter} from "./PropertySignatureStructurePrinter";

export class TypeElementMemberedNodeStructurePrinter extends StructurePrinter<TypeElementMemberedNodeStructure> {
    private readonly callSignatureWriter = new CallSignatureDeclarationStructurePrinter();
    private readonly constructSignatureWriter = new ConstructSignatureDeclarationStructurePrinter();
    private readonly indexSignatureWriter = new IndexSignatureDeclarationStructurePrinter();
    private readonly methodWriter = new MethodSignatureStructurePrinter();
    private readonly propertyWriter = new PropertySignatureStructurePrinter();

    printText(writer: CodeBlockWriter, structure: TypeElementMemberedNodeStructure) {
        this.callSignatureWriter.printTexts(writer, structure.callSignatures);

        this.conditionalSeparator(writer, structure.constructSignatures);
        this.constructSignatureWriter.printTexts(writer, structure.constructSignatures);

        this.conditionalSeparator(writer, structure.indexSignatures);
        this.indexSignatureWriter.printTexts(writer, structure.indexSignatures);

        this.conditionalSeparator(writer, structure.properties);
        this.propertyWriter.printTexts(writer, structure.properties);

        this.conditionalSeparator(writer, structure.methods);
        this.methodWriter.printTexts(writer, structure.methods);
    }

    private conditionalSeparator(writer: CodeBlockWriter, structures: any[] | undefined) {
        if (!ArrayUtils.isNullOrEmpty(structures) && !writer.isAtStartOfFirstLineOfBlock())
            writer.newLine();
    }
}
