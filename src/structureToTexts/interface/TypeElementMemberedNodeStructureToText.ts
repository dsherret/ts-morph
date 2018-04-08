import {TypeElementMemberedNodeStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {StructureToText} from "../StructureToText";
import {CallSignatureDeclarationStructureToText} from "./CallSignatureDeclarationStructureToText";
import {ConstructSignatureDeclarationStructureToText} from "./ConstructSignatureDeclarationStructureToText";
import {IndexSignatureDeclarationStructureToText} from "./IndexSignatureDeclarationStructureToText";
import {MethodSignatureStructureToText} from "./MethodSignatureStructureToText";
import {PropertySignatureStructureToText} from "./PropertySignatureStructureToText";

export class TypeElementMemberedNodeStructureToText extends StructureToText<TypeElementMemberedNodeStructure> {
    private readonly callSignatureWriter = new CallSignatureDeclarationStructureToText(this.writer);
    private readonly constructSignatureWriter = new ConstructSignatureDeclarationStructureToText(this.writer);
    private readonly indexSignatureWriter = new IndexSignatureDeclarationStructureToText(this.writer);
    private readonly methodWriter = new MethodSignatureStructureToText(this.writer);
    private readonly propertyWriter = new PropertySignatureStructureToText(this.writer);

    writeText(structure: TypeElementMemberedNodeStructure) {
        this.callSignatureWriter.writeTexts(structure.callSignatures);

        this.conditionalSeparator(structure.constructSignatures);
        this.constructSignatureWriter.writeTexts(structure.constructSignatures);

        this.conditionalSeparator(structure.indexSignatures);
        this.indexSignatureWriter.writeTexts(structure.indexSignatures);

        this.conditionalSeparator(structure.properties);
        this.propertyWriter.writeTexts(structure.properties);

        this.conditionalSeparator(structure.methods);
        this.methodWriter.writeTexts(structure.methods);
    }

    private conditionalSeparator(structures: any[] | undefined) {
        if (!ArrayUtils.isNullOrEmpty(structures) && !this.writer.isAtStartOfFirstLineOfBlock())
            this.writer.newLine();
    }
}
