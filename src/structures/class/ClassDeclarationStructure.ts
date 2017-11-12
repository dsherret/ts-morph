import {NamedNodeStructure, ImplementsClauseableNodeStructure, DecoratableNodeStructure, TypeParameteredNodeStructure,
    DocumentationableNodeStructure, AmbientableNodeStructure, AbstractableNodeStructure, ExportableNodeStructure} from "./../base";
import {PropertyDeclarationStructure} from "./PropertyDeclarationStructure";
import {MethodDeclarationStructure} from "./MethodDeclarationStructure";
import {ConstructorDeclarationStructure} from "./ConstructorDeclarationStructure";
import {GetAccessorDeclarationStructure} from "./GetAccessorDeclarationStructure";
import {SetAccessorDeclarationStructure} from "./SetAccessorDeclarationStructure";

export interface ClassDeclarationStructure
    extends NamedNodeStructure, ClassDeclarationSpecificStructure, ImplementsClauseableNodeStructure, DecoratableNodeStructure,
        TypeParameteredNodeStructure, DocumentationableNodeStructure, AmbientableNodeStructure, AbstractableNodeStructure, ExportableNodeStructure
{
}

export interface ClassDeclarationSpecificStructure {
    extends?: string;
    ctor?: ConstructorDeclarationStructure;
    properties?: PropertyDeclarationStructure[];
    getAccessors?: GetAccessorDeclarationStructure[];
    setAccessors?: SetAccessorDeclarationStructure[];
    methods?: MethodDeclarationStructure[];
}
