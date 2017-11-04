import * as ts from "typescript";
import * as errors from "./../../errors";
import {removeChildren, removeChildrenWithFormattingFromCollapsibleSyntaxList, FormattingKind} from "./../../manipulation";
import {TypeGuards} from "./../../utils";
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
            const callExpression = this.getCallExpression()!;
            return getIdentifierFromName(callExpression.getExpression());
        }

        return getIdentifierFromName(this.getExpression());

        function getIdentifierFromName(expression: Expression) {
            const identifier = getNameFromExpression(expression);
            if (!TypeGuards.isIdentifier(identifier)) {
                throw new errors.NotImplementedError(`Expected the decorator expression '${identifier.getText()}' to be an identifier, ` +
                    `but it wasn't. Please report this as a bug.`);
            }
            return identifier;
        }

        function getNameFromExpression(expression: Expression) {
            if (TypeGuards.isPropertyAccessExpression(expression))
                return expression.getNameIdentifier();
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

        return this.getExpression() as any as CallExpression;
    }

    /**
     * Gets the expression.
     */
    getExpression(): Expression<ts.LeftHandSideExpression> {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.expression, this.sourceFile) as Expression<ts.LeftHandSideExpression>;
    }

    /**
     * Gets the decorator's arguments from its call expression.
     */
    getArguments(): Node[] {
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
    removeTypeArgument(typeArg: Node): this;
    /**
     * Removes a type argument.
     * @param index - Index to remove.
     */
    removeTypeArgument(index: number): this;
    removeTypeArgument(typeArgOrIndex: Node | number) {
        const callExpression = this.getCallExpression();
        if (callExpression == null)
            throw new errors.InvalidOperationError("Cannot remove a type argument from a decorator that has no type arguments.");

        callExpression.removeTypeArgument(typeArgOrIndex);
        return this;
    }

    /**
     * Removes an argument based on the node.
     * @param node - Argument's node to remove.
     */
    removeArgument(node: Node): this;
    /**
     * Removes an argument based on the specified index.
     * @param index - Index to remove.
     */
    removeArgument(index: number): this;
    removeArgument(argOrIndex: Node | number): this {
        const callExpression = this.getCallExpression();
        if (callExpression == null)
            throw new errors.InvalidOperationError("Cannot remove an argument from a decorator that has no arguments.");

        callExpression.removeArgument(argOrIndex);
        return this;
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
