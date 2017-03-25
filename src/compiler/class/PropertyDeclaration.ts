import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, TypedNode, InitializerExpressionableNode} from "./../base";

export const PropertyDeclarationBase = InitializerExpressionableNode(TypedNode(PropertyNamedNode(Node)));
export class PropertyDeclaration extends PropertyDeclarationBase<ts.PropertyDeclaration> {
    /**
     * Gets if it's optional.
     */
    isOptional() {
        return this.node.questionToken != null;
    }

    /**
     * Gets if it's readonly.
     */
    isReadonly() {
        return this.getReadonlyKeyword() != null;
    }

    /**
     * Gets the readonly keyword, or undefined if none exists.
     */
    getReadonlyKeyword() {
        return this.getFirstModifierByKind(ts.SyntaxKind.ReadonlyKeyword);
    }
}
