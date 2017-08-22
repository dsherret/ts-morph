import * as ts from "typescript";
import {removeChildren, removeChildrenWithFormattingFromCollapsibleSyntaxList, FormattingKind} from "./../../manipulation";
import {Node, CallExpression, Expression} from "./../common";
import {TypeNode} from "./../type";

export const DecoratorBase = Node;
export class Decorator extends DecoratorBase<ts.Decorator> {
    /**
     * Gets the decorator name.
     */
    getName() {
        const sourceFile = this.getSourceFile();

        if (this.isDecoratorFactory()) {
            const callExpression = this.compilerNode.expression as ts.CallExpression;
            return getNameFromExpression(callExpression.expression);
        }

        return getNameFromExpression(this.compilerNode.expression);

        function getNameFromExpression(expression: ts.LeftHandSideExpression) {
            if (expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
                const propAccess = expression as ts.PropertyAccessExpression;
                return propAccess.name.getText(sourceFile.compilerNode);
            }
            return expression.getText(sourceFile.compilerNode);
        }
    }

    /**
     * Gets the full decorator name.
     */
    getFullName() {
        const sourceFile = this.getSourceFile();
        if (this.isDecoratorFactory())
            return this.getCallExpression()!.getExpression().getText();

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
    getCallExpression(): CallExpression | undefined {
        if (!this.isDecoratorFactory())
            return undefined;

        return this.global.compilerFactory.getCallExpression(this.compilerNode.expression as ts.CallExpression, this.sourceFile) as CallExpression;
    }

    /**
     * Gets the decorator's arguments from its call expression.
     */
    getArguments(): Expression[] {
        const callExpression = this.getCallExpression();
        return callExpression == null ? [] : callExpression.getArguments();
    }

    /**
     * Gets the decorator's type arguments from its call expression.
     */
    getTypeArguments(): TypeNode[] {
        const callExpression = this.getCallExpression();
        return callExpression == null ? [] : callExpression.getTypeArguments();
    }

    /**
     * Removes this decorator.
     */
    remove() {
        const thisStartLinePos = this.getStartLinePos();
        const previousDecorator = this.getPreviousSiblingIfKind(ts.SyntaxKind.Decorator);

        if (previousDecorator != null && previousDecorator.getStartLinePos() === thisStartLinePos) {
            removeChildren({
                children: [this],
                removePrecedingSpaces: true
            });
        }
        else
            removeChildrenWithFormattingFromCollapsibleSyntaxList({
                children: [this],
                getSiblingFormatting: (parent, sibling) => sibling.getStartLinePos() === thisStartLinePos ? FormattingKind.Space : FormattingKind.Newline
            });
    }
}
