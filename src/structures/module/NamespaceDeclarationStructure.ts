import { NamespaceDeclarationKind } from "../../compiler";
import { AmbientableNodeStructure, BodiedNodeStructure, ExportableNodeStructure, JSDocableNodeStructure, NamedNodeStructure,
    ModuledNodeStructure } from "../base";
import { StatementedNodeStructure } from "../statement";
import { Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface NamespaceDeclarationStructure
    extends Structure<StructureKind.NamespaceDeclaration>, NamedNodeStructure, NamespaceDeclarationSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure,
        StatementedNodeStructure, BodiedNodeStructure, ModuledNodeStructure
{
}

export interface NamespaceDeclarationSpecificStructure {
    /**
     * The namespace declaration kind.
     *
     * @remarks Defaults to "namespace".
     */
    declarationKind?: NamespaceDeclarationKind;
}
