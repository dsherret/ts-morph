import { WriterFunction } from "../../../types";
import { AbstractableNodeStructure, DecoratableNodeStructure, ImplementsClauseableNodeStructure,
    JSDocableNodeStructure, NameableNodeStructure, TypeParameteredNodeStructure } from "../../base";
import { ConstructorDeclarationStructure } from "../ConstructorDeclarationStructure";
import { GetAccessorDeclarationStructure } from "../GetAccessorDeclarationStructure";
import { MethodDeclarationStructure } from "../MethodDeclarationStructure";
import { PropertyDeclarationStructure } from "../PropertyDeclarationStructure";
import { SetAccessorDeclarationStructure } from "../SetAccessorDeclarationStructure";

export interface ClassLikeDeclarationBaseStructure
    extends NameableNodeStructure, ClassLikeDeclarationBaseSpecificStructure, ImplementsClauseableNodeStructure, DecoratableNodeStructure,
        TypeParameteredNodeStructure, JSDocableNodeStructure, AbstractableNodeStructure
{
}

export interface ClassLikeDeclarationBaseSpecificStructure {
    extends?: string | WriterFunction;
    ctors?: ConstructorDeclarationStructure[];
    properties?: PropertyDeclarationStructure[];
    getAccessors?: GetAccessorDeclarationStructure[];
    setAccessors?: SetAccessorDeclarationStructure[];
    methods?: MethodDeclarationStructure[];
}
