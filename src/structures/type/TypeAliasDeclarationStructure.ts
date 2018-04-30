import { WriterFunction } from "../../types";
import { NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure } from "../base";

export interface TypeAliasDeclarationStructure
    extends NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
    type: string | WriterFunction; // make required (from base)
}
