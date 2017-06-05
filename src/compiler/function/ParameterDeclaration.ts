import * as ts from "typescript";
import {Node} from "./../common";
import {insertStraight, removeNodes} from "./../../manipulation";
import {DeclarationNamedNode, InitializerExpressionableNode, TypedNode, ModifierableNode, ScopeableNode, ReadonlyableNode, DecoratableNode, QuestionTokenableNode} from "./../base";

export const ParameterDeclarationBase = QuestionTokenableNode(DecoratableNode(ScopeableNode(ReadonlyableNode(ModifierableNode(
    TypedNode(InitializerExpressionableNode(DeclarationNamedNode(Node)))
)))));
export class ParameterDeclaration extends ParameterDeclarationBase<ts.ParameterDeclaration> {
    /**
     * Gets the dot dot dot token (...) for a rest parameter.
     */
    getDotDotDotToken() {
        return this.node.dotDotDotToken == null ? undefined : this.factory.getNodeFromCompilerNode(this.node.dotDotDotToken, this.sourceFile);
    }

    /**
     * Gets if it's a rest parameter.
     */
    isRestParameter() {
        return this.node.dotDotDotToken != null;
    }

    /**
     * Sets if it's a rest parameter.
     * @param value - Sets if it's a rest parameter or not.
     */
    setIsRestParameter(value: boolean) {
        if (this.isRestParameter() === value)
            return this;

        if (value)
            insertStraight(this.getSourceFile(), this.getNameNodeOrThrow().getStart(), this, "...");
        else
            removeNodes(this.getSourceFile(), [this.getDotDotDotToken()!], { removePrecedingSpaces: false });

        return this;
    }

    /**
     * Gets if it's optional.
     */
    isOptional() {
        return this.node.questionToken != null || this.isRestParameter() || this.hasInitializer();
    }
}
