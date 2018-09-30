import { JSDocableNodeStructure, ReadonlyableNodeStructure, ReturnTypedNodeStructure } from "../base";

export interface IndexSignatureDeclarationStructure
    extends IndexSignatureDeclarationSpecificStructure, JSDocableNodeStructure, ReadonlyableNodeStructure, ReturnTypedNodeStructure
{
}

export interface IndexSignatureDeclarationSpecificStructure {
    keyName?: string;
    keyType?: string;
}
