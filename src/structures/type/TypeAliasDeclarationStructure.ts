import { WriterFunction } from "../../types";
import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure, NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure } from "../base";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface TypeAliasDeclarationStructure
    extends Structure<StructureKind.TypeAlias>, TypeAliasDeclarationSpecificStructure, NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure,
        JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
        type: string | WriterFunction; // make required (from base)
}

export interface TypeAliasDeclarationSpecificStructure {
    type: string | WriterFunction; // make required (from base)
}
