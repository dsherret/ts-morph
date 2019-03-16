import { JSDocableNodeStructure, ReadonlyableNodeStructure, ReturnTypedNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface IndexSignatureDeclarationStructure
    extends IndexSignatureDeclarationSpecificStructure, JSDocableNodeStructure, ReadonlyableNodeStructure,
        ReturnTypedNodeStructure
{
}

export interface IndexSignatureDeclarationSpecificStructure extends Structure<StructureKind.IndexSignature> {
    keyName?: string;
    keyType?: string;
}
