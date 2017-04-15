import * as ts from "typescript";
import {Node} from "./../common";

export const DecoratorBase = Node;
export class Decorator extends DecoratorBase<ts.Decorator> {
    /**
     * Gets the decorator name.
     */
    getName() {
        const sourceFile = this.getRequiredSourceFile();
        function getNameFromExpression(expression: ts.LeftHandSideExpression) {
            if (expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
                const propAccess = expression as ts.PropertyAccessExpression;
                return propAccess.name.getText(sourceFile.node);
            }
            return expression.getText(sourceFile.node);
        }

        if (this.isDecoratorFactory()) {
            const callExpression = this.node.expression as ts.CallExpression;
            return getNameFromExpression(callExpression.expression);
        }

        return getNameFromExpression(this.node.expression);
    }

    /**
     * Gets the full decorator name.
     */
    getFullName() {
        const sourceFile = this.getRequiredSourceFile();
        if (this.isDecoratorFactory()) {
            const callExpression = this.node.expression as ts.CallExpression;
            return callExpression.expression.getText(sourceFile.node);
        }

        return this.node.expression.getText(sourceFile.node);
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
