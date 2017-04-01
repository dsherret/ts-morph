import * as ts from "typescript";
import {Node} from "./../common";
import {DeclarationNamedNode, InitializerExpressionableNode, TypedNode, ModifierableNode, ScopeableNode, ReadonlyableNode} from "./../base";

export const ParameterDeclarationBase = ScopeableNode(ReadonlyableNode(ModifierableNode(TypedNode(InitializerExpressionableNode(DeclarationNamedNode(Node))))));
export class ParameterDeclaration extends ParameterDeclarationBase<ts.ParameterDeclaration> {
    /**
     * Gets if it's a rest parameter.
     */
    isRestParameter() {
        return this.node.dotDotDotToken != null;
    }

    /**
     * Gets if it's optional.
     */
    isOptional() {
        return this.node.questionToken != null || this.isRestParameter() || this.hasInitializer();
    }
}
