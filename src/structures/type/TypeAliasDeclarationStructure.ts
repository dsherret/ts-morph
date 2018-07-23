import { WriterFunction } from "../../types";
import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure, NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure } from "../base";

export interface TypeAliasDeclarationStructure
    extends TypeAliasDeclarationSpecificStructure, NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure, 
    JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure {
        type: string | WriterFunction; // make required (from base)
}

export interface TypeAliasDeclarationSpecificStructure {
    type: string | WriterFunction; // make required (from base)
}
