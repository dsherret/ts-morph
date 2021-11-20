import { JSDocableNodeStructure, ReadonlyableNodeStructure, ReturnTypedNodeStructure } from "../base";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface IndexSignatureDeclarationStructure
  extends Structure, IndexSignatureDeclarationSpecificStructure, JSDocableNodeStructure, ReadonlyableNodeStructure, ReturnTypedNodeStructure
{
}

export interface IndexSignatureDeclarationSpecificStructure extends KindedStructure<StructureKind.IndexSignature> {
  keyName?: string;
  keyType?: string;
}
