import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, TypedNode, InitializerExpressionableNode, QuestionTokenableNode, ReadonlyableNode, DocumentationableNode, StaticableNode,
    ModifierableNode} from "./../base";
import {AbstractableNode, ScopedNode} from "./base";

export const PropertyDeclarationBase = AbstractableNode(ScopedNode(StaticableNode(DocumentationableNode(ReadonlyableNode(QuestionTokenableNode(
    InitializerExpressionableNode(TypedNode(PropertyNamedNode(ModifierableNode(Node))))
))))));
export class PropertyDeclaration extends PropertyDeclarationBase<ts.PropertyDeclaration> {
}
