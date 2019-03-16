import { JSDocableNodeStructure, ReadonlyableNodeStructure, ReturnTypedNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface IndexSignatureDeclarationStructure
    extends Structure<StructureKind.IndexSignature>, IndexSignatureDeclarationSpecificStructure, JSDocableNodeStructure, ReadonlyableNodeStructure,
        ReturnTypedNodeStructure
{
}

export interface IndexSignatureDeclarationSpecificStructure {
    keyName?: string;
    keyType?: string;
}
