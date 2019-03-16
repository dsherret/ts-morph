﻿import { AmbientableNodeStructure, ExportableNodeStructure, ExtendsClauseableNodeStructure, JSDocableNodeStructure, NamedNodeStructure,
    TypeElementMemberedNodeStructure, TypeParameteredNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface InterfaceDeclarationStructure
    extends NamedNodeStructure, InterfaceDeclarationSpecificStructure, ExtendsClauseableNodeStructure, TypeParameteredNodeStructure,
        JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure, TypeElementMemberedNodeStructure
{
}

export interface InterfaceDeclarationSpecificStructure extends Structure<StructureKind.Interface> {
}
