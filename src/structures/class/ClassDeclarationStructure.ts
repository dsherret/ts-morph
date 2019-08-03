import { AmbientableNodeStructure, ExportableNodeStructure } from "../base";
import { Structure, KindedStructure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { ClassLikeDeclarationBaseStructure } from "./base";

export interface ClassDeclarationStructure
    extends Structure, ClassLikeDeclarationBaseStructure, ClassDeclarationSpecificStructure, AmbientableNodeStructure, ExportableNodeStructure
{
    /**
     * The class name.
     * @remarks Can be undefined. For example: `export default class { ... }`
     */
    name?: string;
}

export interface ClassDeclarationSpecificStructure extends KindedStructure<StructureKind.Class> {
}
