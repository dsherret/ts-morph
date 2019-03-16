import { NamespaceDeclarationKind } from "../../compiler";
import { AmbientableNodeStructure, BodiedNodeStructure, ExportableNodeStructure, JSDocableNodeStructure, NamedNodeStructure,
    ModuledNodeStructure } from "../base";
import { StatementedNodeStructure } from "../statement";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface NamespaceDeclarationStructure
    extends Structure, NamedNodeStructure, NamespaceDeclarationSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure,
        StatementedNodeStructure, BodiedNodeStructure, ModuledNodeStructure
{
}

export interface NamespaceDeclarationSpecificStructure extends KindedStructure<StructureKind.NamespaceDeclaration> {
    /**
     * The namespace declaration kind.
     *
     * @remarks Defaults to "namespace".
     */
    declarationKind?: NamespaceDeclarationKind;
}
