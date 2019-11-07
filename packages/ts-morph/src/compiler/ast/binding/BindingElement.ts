import { errors, ts } from "@ts-morph/common";
import { BindingNamedNode, InitializerExpressionableNode } from "../base";
import { Node } from "../common";

const createBase = <T extends typeof Node>(ctor: T) => InitializerExpressionableNode(BindingNamedNode(ctor));
export const BindingElementBase = createBase(Node);
export class BindingElement extends BindingElementBase<ts.BindingElement> {
    /**
     * Gets the binding element's dot dot dot token (...) if it exists or throws if not.
     */
    getDotDotDotTokenOrThrow() {
        return errors.throwIfNullOrUndefined(this.getDotDotDotToken(), "Expected to find a dot dot dot token (...).");
    }

    /**
     * Gets the binding element's dot dot dot token (...) if it exists or returns undefined.
     */
    getDotDotDotToken() {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.dotDotDotToken);
    }

    /**
     * Gets binding element's property name node or throws if not found.
     *
     * For example in `const { a: b } = { a: 5 }`, `a` would be the property name.
     */
    getPropertyNameNodeOrThrow() {
        return errors.throwIfNullOrUndefined(this.getPropertyNameNode(), "Expected to find a property name node.");
    }

    /**
     * Gets binding element's property name node or returns undefined if not found.
     *
     * For example in `const { a: b } = { a: 5 }`, `a` would be the property name.
     */
    getPropertyNameNode() {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.propertyName);
    }
}
