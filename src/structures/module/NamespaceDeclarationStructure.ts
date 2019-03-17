import { NamespaceDeclarationKind } from "../../compiler";
import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure, NamedNodeStructure,
    ModuledNodeStructure } from "../base";
import { StatementedNodeStructure } from "../statement";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface NamespaceDeclarationStructure
    extends Structure, NamedNodeStructure, NamespaceDeclarationSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure,
        StatementedNodeStructure, ModuledNodeStructure
{
}

export interface NamespaceDeclarationSpecificStructure extends KindedStructure<StructureKind.Namespace> {
    /**
     * The namespace declaration kind.
     *
     * @remarks Defaults to "namespace".
     */
    declarationKind?: NamespaceDeclarationKind;
}
