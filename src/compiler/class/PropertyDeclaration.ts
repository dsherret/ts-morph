import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, TypedNode, InitializerExpressionableNode, QuestionTokenableNode, ReadonlyableNode, DocumentationableNode, StaticableNode,
    ModifierableNode, ScopedNode, DecoratableNode} from "./../base";
import {AbstractableNode} from "./base";

export const PropertyDeclarationBase = DecoratableNode(AbstractableNode(ScopedNode(StaticableNode(DocumentationableNode(ReadonlyableNode(QuestionTokenableNode(
    InitializerExpressionableNode(TypedNode(PropertyNamedNode(ModifierableNode(Node))))
)))))));
export class PropertyDeclaration extends PropertyDeclarationBase<ts.PropertyDeclaration> {
}
