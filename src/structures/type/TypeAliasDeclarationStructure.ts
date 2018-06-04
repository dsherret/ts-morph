import { WriterFunction } from "../../types";
import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure, NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure } from "../base";

export interface TypeAliasDeclarationStructure
    extends NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
    type: string | WriterFunction; // make required (from base)
}
