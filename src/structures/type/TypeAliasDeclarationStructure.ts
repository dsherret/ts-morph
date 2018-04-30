import { CodeBlockWriter } from "../../codeBlockWriter";
import { NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure } from "../base";

export interface TypeAliasDeclarationStructure
    extends NamedNodeStructure, TypedNodeStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure
{
    type: string | ((writer: CodeBlockWriter) => void); // make required (from base)
}
