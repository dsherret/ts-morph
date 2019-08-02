import { AmbientableNodeStructure, ExportableNodeStructure, ExtendsClauseableNodeStructure, JSDocableNodeStructure, NamedNodeStructure,
    TypeElementMemberedNodeStructure, TypeParameteredNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface InterfaceDeclarationStructure
    extends Structure, NamedNodeStructure, InterfaceDeclarationSpecificStructure, ExtendsClauseableNodeStructure, TypeParameteredNodeStructure,
        JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, TypeElementMemberedNodeStructure
{
}

export interface InterfaceDeclarationSpecificStructure extends KindedStructure<StructureKind.Interface> {
}
