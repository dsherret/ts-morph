import { WriterFunction } from "../../types";
import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure, NamedNodeStructure, TypedNodeStructure,
    TypeParameteredNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface TypeAliasDeclarationStructure
    extends Structure, TypeAliasDeclarationSpecificStructure, NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure,
        AmbientableNodeStructure, ExportableNodeStructure
{
    type: string | WriterFunction; // make required (from base)
}

export interface TypeAliasDeclarationSpecificStructure extends KindedStructure<StructureKind.TypeAlias> {
    type: string | WriterFunction; // make required (from base)
}
