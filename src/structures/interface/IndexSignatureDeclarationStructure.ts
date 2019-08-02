import { JSDocableNodeStructure, ReadonlyableNodeStructure, ReturnTypedNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface IndexSignatureDeclarationStructure
    extends Structure, IndexSignatureDeclarationSpecificStructure, JSDocableNodeStructure, ReadonlyableNodeStructure, ReturnTypedNodeStructure
{
}

export interface IndexSignatureDeclarationSpecificStructure extends KindedStructure<StructureKind.IndexSignature> {
    keyName?: string;
    keyType?: string;
}
