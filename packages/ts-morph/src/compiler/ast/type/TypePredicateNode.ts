import { ts, errors } from "@ts-morph/common";
import { TypeNode } from "./TypeNode";

/**
 * A type predicate node which says the specified parameter name is a specific type if the function returns true.
 *
 * Examples:
 * * `param is string` in `declare function isString(param: unknown): param is string;`.
 * * `asserts condition` in `declare function assert(condition: any): asserts condition;`.
 */
export class TypePredicateNode extends TypeNode<ts.TypePredicateNode> {
    /**
     * Gets the parameter name node
     */
    getParameterNameNode() {
        return this._getNodeFromCompilerNode(this.compilerNode.parameterName);
    }

    /**
     * Gets if the type predicate has an `asserts` modifier (ex. `asserts condition`).
     */
    hasAssertsModifier() {
        return this.compilerNode.assertsModifier != null;
    }

    /**
     * Gets the asserts modifier if it exists.
     */
    getAssertsModifier() {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.assertsModifier);
    }

    /**
     * Gets the asserts modifier if it exists or throws otherwise.
     */
    getAssertsModifierOrThrow() {
        return errors.throwIfNullOrUndefined(this.getAssertsModifier(), "Expected to find an asserts modifier.");
    }

    /**
     * Gets the type name if it exists or returns undefined when it asserts a condition.
     */
    getTypeNode(): TypeNode | undefined {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.type);
    }

    /**
     * Gets the type name if it exists or throws when it asserts a condition.
     */
    getTypeNodeOrThrow(): TypeNode {
        return errors.throwIfNullOrUndefined(this.getTypeNode(), "Expected to find a type node.");
    }
}
