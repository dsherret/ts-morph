import * as ts from "typescript";
import * as errors from "./../../../errors";
import {NamedNode, QuestionTokenableNode, InitializerGetExpressionableNode} from "./../../base";
import {Expression} from "./../Expression";
import {Node} from "./../Node";

export const ShorthandPropertyAssignmentBase = InitializerGetExpressionableNode(QuestionTokenableNode(NamedNode(Node)));
export class ShorthandPropertyAssignment extends ShorthandPropertyAssignmentBase<ts.ShorthandPropertyAssignment> {
    // todo #65: Implement manipulation for initiailizer (need to dispose this node and change to PropertyAssignment)
    // todo #65: Manipulation methods for the below

    /**
     * Gets the object assignment initializer or throws if it doesn't exist.
     */
    getObjectAssignmentInitializerOrThrow() {
        return errors.throwIfNullOrUndefined(this.getObjectAssignmentInitializer(), "Expected to find an object assignment initializer.");
    }

    /**
     * Gets the object assignment initializer if it exists.
     */
    getObjectAssignmentInitializer() {
        const initializer = this.compilerNode.objectAssignmentInitializer;
        if (initializer == null)
            return undefined;
        return this.global.compilerFactory.getNodeFromCompilerNode(initializer, this.sourceFile) as Expression;
    }

    /**
     * Gets the equals token or throws if it doesn't exist.
     */
    getEqualsTokenOrThrow() {
        return errors.throwIfNullOrUndefined(this.getEqualsToken(), "Expected to find an equals token.");
    }

    /**
     * Gets the equals token if it exists.
     */
    getEqualsToken() {
        const equalsToken = this.compilerNode.equalsToken;
        if (equalsToken == null)
            return undefined;
        return this.global.compilerFactory.getNodeFromCompilerNode(equalsToken, this.sourceFile);
    }
}
