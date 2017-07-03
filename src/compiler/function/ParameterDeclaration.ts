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
        return this.compilerNode.dotDotDotToken == null ? undefined : this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.dotDotDotToken, this.sourceFile);
    }

    /**
     * Gets if it's a rest parameter.
     */
    isRestParameter() {
        return this.compilerNode.dotDotDotToken != null;
    }

    /**
     * Gets if this is a parameter property.
     */
    isParameterProperty() {
        return this.getScope() != null || this.isReadonly();
    }

    /**
     * Sets if it's a rest parameter.
     * @param value - Sets if it's a rest parameter or not.
     */
    setIsRestParameter(value: boolean) {
        if (this.isRestParameter() === value)
            return this;

        if (value)
            insertStraight({ insertPos: this.getNameIdentifierOrThrow().getStart(), parent: this, newCode: "..." });
        else
            removeNodes([this.getDotDotDotToken()!], { removePrecedingSpaces: false });

        return this;
    }

    /**
     * Gets if it's optional.
     */
    isOptional() {
        return this.compilerNode.questionToken != null || this.isRestParameter() || this.hasInitializer();
    }
}
