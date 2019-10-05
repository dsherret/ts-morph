import { ts } from "../../../typescript";
import { TypeNode } from "./TypeNode";

/**
 * A type predicate node which says the specified parameter name is a specific type if the function returns true.
 *
 * For example, `param is string` in `declare function isString(param: unknown): param is string;`.
 */
export class TypePredicateNode extends TypeNode<ts.TypePredicateNode> {
    /**
     * Gets the parameter name node
     */
    getParameterNameNode() {
        return this._getNodeFromCompilerNode(this.compilerNode.parameterName);
    }

    /**
     * Gets the type name.
     */
    getTypeNode(): TypeNode {
        return this._getNodeFromCompilerNode(this.compilerNode.type);
    }
}
