import { ts } from "../../typescript";
import { BindingNamedNode, InitializerExpressionableNode } from "../base";
import { Node } from "../common";

export const BindingElementBase = InitializerExpressionableNode(BindingNamedNode(Node));
export class BindingElement extends BindingElementBase<ts.BindingElement> {
    /**
     * Gets the binding element's dot dot dot token (...) if it exists.
     */
    getDotDotDotToken() {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.dotDotDotToken);
    }

    /**
     * Gets binding element's property name node. For example in `const { a: b } = { a: 5 }`, `a` would be the property name.
     */
    getPropertyNameNode() {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.propertyName);
    }
}
