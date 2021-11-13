import { ModuleDeclarationKind } from "../../compiler";
import { AmbientableNodeStructure, ExportableNodeStructure, JSDocableNodeStructure, ModuleNamedNodeStructure } from "../base";
import { StatementedNodeStructure } from "../statement";
import { KindedStructure, Structure } from "../Structure";
import { StructureKind } from "../StructureKind";

export interface ModuleDeclarationStructure
  extends
    Structure,
    ModuleNamedNodeStructure,
    ModuleDeclarationSpecificStructure,
    JSDocableNodeStructure,
    AmbientableNodeStructure,
    ExportableNodeStructure,
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
