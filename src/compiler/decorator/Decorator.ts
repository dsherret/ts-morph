import * as ts from "typescript";
import * as errors from "./../../errors";
import {removeChildren, removeChildrenWithFormattingFromCollapsibleSyntaxList, FormattingKind} from "./../../manipulation";
import {Node, CallExpression, Expression, Identifier} from "./../common";
import {TypeNode} from "./../type";

export const DecoratorBase = Node;
export class Decorator extends DecoratorBase<ts.Decorator> {
    /**
     * Gets the decorator name.
     */
    getName() {
        return this.getNameIdentifier().getText();
    }

    /**
     * Gets the name identifier of the decorator.
     */
    getNameIdentifier() {
        const sourceFile = this.getSourceFile();

        if (this.isDecoratorFactory()) {
            const callExpression = this.compilerNode.expression as ts.CallExpression;
            return getIdentifierFromName(callExpression.expression);
        }

        return getIdentifierFromName(this.compilerNode.expression);

        function getIdentifierFromName(expression: ts.LeftHandSideExpression) {
            const identifier = getNameFromExpression(expression);
            if (identifier.kind !== ts.SyntaxKind.Identifier) {
                throw new errors.NotImplementedError(`Expected the decorator expression '${identifier.getText(sourceFile.compilerNode)}' to be an identifier, ` +
                    `but it wasn't. Please report this as a bug.`);
            }
            return sourceFile.global.compilerFactory.getNodeFromCompilerNode(identifier, sourceFile) as Identifier;
        }

        function getNameFromExpression(expression: ts.LeftHandSideExpression) {
            if (expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
                const propAccess = expression as ts.PropertyAccessExpression;
                return propAccess.name;
            }
            return expression;
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

        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.expression as ts.CallExpression, this.sourceFile) as CallExpression;
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
     * Removes a type argument.
     * @param typeArg - Type argument to remove.
     */
    removeTypeArgument(typeArg: Node): void;
    /**
     * Removes a type argument.
     * @param index - Index to remove.
     */
    removeTypeArgument(index: number): void;
    removeTypeArgument(typeArgOrIndex: Node | number) {
        const callExpression = this.getCallExpression();
        if (callExpression == null)
            throw new errors.InvalidOperationError("Cannot remove a type argument from a decorator that has no type arguments.");

        callExpression.removeTypeArgument(typeArgOrIndex);
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
