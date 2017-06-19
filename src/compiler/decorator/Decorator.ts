import * as ts from "typescript";
import {Node} from "./../common";

export const DecoratorBase = Node;
export class Decorator extends DecoratorBase<ts.Decorator> {
    /**
     * Gets the decorator name.
     */
    getName() {
        const sourceFile = this.getSourceFile();
        function getNameFromExpression(expression: ts.LeftHandSideExpression) {
            if (expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
                const propAccess = expression as ts.PropertyAccessExpression;
                return propAccess.name.getText(sourceFile.compilerNode);
            }
            return expression.getText(sourceFile.compilerNode);
        }

        if (this.isDecoratorFactory()) {
            const callExpression = this.compilerNode.expression as ts.CallExpression;
            return getNameFromExpression(callExpression.expression);
        }

        return getNameFromExpression(this.compilerNode.expression);
    }

    /**
     * Gets the full decorator name.
     */
    getFullName() {
        const sourceFile = this.getSourceFile();
        if (this.isDecoratorFactory()) {
            const callExpression = this.compilerNode.expression as ts.CallExpression;
            return callExpression.expression.getText(sourceFile.compilerNode);
        }

        return this.compilerNode.expression.getText(sourceFile.compilerNode);
    }

    /**
     * Gets if the decorator is a decorator factory.
     */
    isDecoratorFactory() {
        return this.compilerNode.expression.kind === ts.SyntaxKind.CallExpression;
    }

    /**
     * Gets the compiler call expression if a decorator factory.
     */
    getCallExpression(): Node<ts.CallExpression> | undefined {
        if (!this.isDecoratorFactory())
            return undefined;

        return this.factory.getNodeFromCompilerNode(this.compilerNode.expression, this.sourceFile) as Node<ts.CallExpression>;
    }
}
