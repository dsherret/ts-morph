import * as ts from "typescript";
import {Node} from "./../common";

export const DecoratorBase = Node;
export class Decorator extends DecoratorBase<ts.Decorator> {
    /**
     * Gets the decorator name.
     */
    getName() {
        if (this.isDecoratorFactory()) {
            const callExpression = this.node.expression as ts.CallExpression;
            return callExpression.expression.getText();
        }

        return this.node.expression.getText(this.getRequiredSourceFile().node);
    }

    /**
     * Gets if the decorator is a decorator factory.
     */
    isDecoratorFactory() {
        return this.node.expression.kind === ts.SyntaxKind.CallExpression;
    }

    /**
     * Gets the compiler call expression if a decorator factory.
     */
    getCompilerCallExpression(): ts.CallExpression | undefined {
        if (!this.isDecoratorFactory())
            return undefined;

        return this.node.expression as ts.CallExpression;
    }
}
