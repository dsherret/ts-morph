import { WriterFunction } from "../../../types";
import { AbstractableNodeStructure, DecoratableNodeStructure, ImplementsClauseableNodeStructure, JSDocableNodeStructure, NameableNodeStructure,
    TypeParameteredNodeStructure } from "../../base";
import { OptionalKind } from "../../types";
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
    ctors?: OptionalKind<ConstructorDeclarationStructure>[];
    properties?: OptionalKind<PropertyDeclarationStructure>[];
    getAccessors?: OptionalKind<GetAccessorDeclarationStructure>[];
    setAccessors?: OptionalKind<SetAccessorDeclarationStructure>[];
    methods?: OptionalKind<MethodDeclarationStructure>[];
}
