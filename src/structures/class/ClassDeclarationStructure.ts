import {NamedStructure, ImplementsClauseableNodeStructure, DecoratableNodeStructure, TypeParameteredNodeStructure,
    DocumentationableNodeStructure, AmbientableNodeStructure, AbstractableNodeStructure, ExportableNodeStructure} from "./../base";
import {PropertyDeclarationStructure} from "./PropertyDeclarationStructure";
import {MethodDeclarationStructure} from "./MethodDeclarationStructure";
import {ConstructorDeclarationStructure} from "./ConstructorDeclarationStructure";

export interface ClassDeclarationStructure
    extends NamedStructure, ClassDeclarationSpecificStructure, ImplementsClauseableNodeStructure, DecoratableNodeStructure,
        TypeParameteredNodeStructure, DocumentationableNodeStructure, AmbientableNodeStructure, AbstractableNodeStructure, ExportableNodeStructure
{
}

export interface ClassDeclarationSpecificStructure {
    extends?: string;
    ctor?: ConstructorDeclarationStructure;
    properties?: PropertyDeclarationStructure[];
    methods?: MethodDeclarationStructure[];
}
