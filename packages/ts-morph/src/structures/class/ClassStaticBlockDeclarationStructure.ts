import { JSDocableNodeStructure } from "../base";
import { StatementedNodeStructure } from "../statement";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface ClassStaticBlockDeclarationStructure
  extends Structure, ClassStaticBlockDeclarationSpecificStructure, JSDocableNodeStructure, StatementedNodeStructure
{
}

export interface ClassStaticBlockDeclarationSpecificStructure extends KindedStructure<StructureKind.ClassStaticBlock> {
}
