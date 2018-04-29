import { NameableNodeStructure, ImplementsClauseableNodeStructure, DecoratableNodeStructure, TypeParameteredNodeStructure,
    JSDocableNodeStructure, AmbientableNodeStructure, AbstractableNodeStructure, ExportableNodeStructure } from "../base";
import { PropertyDeclarationStructure } from "./PropertyDeclarationStructure";
import { MethodDeclarationStructure } from "./MethodDeclarationStructure";
import { ConstructorDeclarationStructure } from "./ConstructorDeclarationStructure";
import { GetAccessorDeclarationStructure } from "./GetAccessorDeclarationStructure";
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
