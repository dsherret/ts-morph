import {TypeElementMemberedNodeStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {StructurePrinter} from "../StructurePrinter";
import {CallSignatureDeclarationStructurePrinter} from "./CallSignatureDeclarationStructurePrinter";
import {ConstructSignatureDeclarationStructurePrinter} from "./ConstructSignatureDeclarationStructurePrinter";
import {IndexSignatureDeclarationStructurePrinter} from "./IndexSignatureDeclarationStructurePrinter";
import {MethodSignatureStructurePrinter} from "./MethodSignatureStructurePrinter";
import {PropertySignatureStructurePrinter} from "./PropertySignatureStructurePrinter";

export class TypeElementMemberedNodeStructurePrinter extends StructurePrinter<TypeElementMemberedNodeStructure> {
    private readonly callSignatureWriter = new CallSignatureDeclarationStructurePrinter(this.writer);
    private readonly constructSignatureWriter = new ConstructSignatureDeclarationStructurePrinter(this.writer);
    private readonly indexSignatureWriter = new IndexSignatureDeclarationStructurePrinter(this.writer);
    private readonly methodWriter = new MethodSignatureStructurePrinter(this.writer);
    private readonly propertyWriter = new PropertySignatureStructurePrinter(this.writer);

    printText(structure: TypeElementMemberedNodeStructure) {
        this.callSignatureWriter.printTexts(structure.callSignatures);

        this.conditionalSeparator(structure.constructSignatures);
        this.constructSignatureWriter.printTexts(structure.constructSignatures);

        this.conditionalSeparator(structure.indexSignatures);
        this.indexSignatureWriter.printTexts(structure.indexSignatures);

        this.conditionalSeparator(structure.properties);
        this.propertyWriter.printTexts(structure.properties);

        this.conditionalSeparator(structure.methods);
        this.methodWriter.printTexts(structure.methods);
    }

    private conditionalSeparator(structures: any[] | undefined) {
        if (!ArrayUtils.isNullOrEmpty(structures) && !this.writer.isAtStartOfFirstLineOfBlock())
            this.writer.newLine();
    }
}
