import { AbstractableNodeStructure, AmbientableNodeStructure, DecoratableNodeStructure, ExportableNodeStructure, ImplementsClauseableNodeStructure,
    JSDocableNodeStructure, NameableNodeStructure, TypeParameteredNodeStructure } from "../base";
import { ConstructorDeclarationStructure } from "./ConstructorDeclarationStructure";
import { GetAccessorDeclarationStructure } from "./GetAccessorDeclarationStructure";
import { MethodDeclarationStructure } from "./MethodDeclarationStructure";
import { PropertyDeclarationStructure } from "./PropertyDeclarationStructure";
import { SetAccessorDeclarationStructure } from "./SetAccessorDeclarationStructure";

export interface ClassDeclarationStructure
    extends NameableNodeStructure, ClassDeclarationSpecificStructure, ImplementsClauseableNodeStructure, DecoratableNodeStructure,
        TypeParameteredNodeStructure, JSDocableNodeStructure, AmbientableNodeStructure, AbstractableNodeStructure, ExportableNodeStructure
{
    /**
     * The class name.
     * @remarks Can be undefined. For example: `export default class { ... }`
     */
    name?: string;
}

export interface ClassDeclarationSpecificStructure {
    extends?: string;
    ctors?: ConstructorDeclarationStructure[];
    properties?: PropertyDeclarationStructure[];
    getAccessors?: GetAccessorDeclarationStructure[];
    setAccessors?: SetAccessorDeclarationStructure[];
    methods?: MethodDeclarationStructure[];
}
