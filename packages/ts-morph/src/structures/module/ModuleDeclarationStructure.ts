import { ModuleDeclarationKind } from "../../compiler";
import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure, NamedNodeStructure } from "../base";
import { StatementedNodeStructure } from "../statement";
import { KindedStructure, Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface ModuleDeclarationStructure
    extends Structure, NamedNodeStructure, ModuleDeclarationSpecificStructure, JSDocableNodeStructure, AmbientableNodeStructure, ExportableNodeStructure,
        StatementedNodeStructure
{
}

export interface ModuleDeclarationSpecificStructure extends KindedStructure<StructureKind.Module> {
    /**
     * The module declaration kind.
     *
     * @remarks Defaults to "namespace".
     */
    declarationKind?: ModuleDeclarationKind;
}
