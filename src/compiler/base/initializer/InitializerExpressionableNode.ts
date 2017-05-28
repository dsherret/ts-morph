import * as ts from "typescript";
import * as errors from "./../../../errors";
import {insertStraight, removeNodes} from "./../../../manipulation";
import {Node, Expression} from "./../../common";
import {SourceFile} from "./../../file";

export type InitializerExpressionedExtensionType = Node<ts.Node & { initializer?: ts.Expression; }>;

export interface InitializerExpressionableNode {
    /**
     * Gets if node has an initializer.
     */
    hasInitializer(): boolean;
    /**
     * Gets the initializer.
     */
    getInitializer(): Expression | undefined;
    /**
     * Removes the initailizer.
     */
    removeInitializer(sourceFile?: SourceFile): this;
    /**
     * Sets the initializer.
     * @param text - New text to set for the initializer.
     * @param sourceFile - Optional source file to help with performance.
     */
    setInitializer(text: string, sourceFile?: SourceFile): this;
}

export function InitializerExpressionableNode<T extends Constructor<InitializerExpressionedExtensionType>>(Base: T): Constructor<InitializerExpressionableNode> & T {
    return class extends Base implements InitializerExpressionableNode {
        hasInitializer() {
            return this.node.initializer != null;
        }

        getInitializer() {
            return this.node.initializer == null ? undefined : this.factory.getExpression(this.node.initializer);
        }

        removeInitializer(sourceFile?: SourceFile) {
            const initializer = this.getInitializer();
            if (initializer == null)
                return this;
            const previousSibling = initializer.getPreviousSibling();

            /* istanbul ignore if */
            if (previousSibling == null || previousSibling.getKind() !== ts.SyntaxKind.FirstAssignment)
                throw this.getNotImplementedError();

            sourceFile = sourceFile || this.getSourceFileOrThrow();
            removeNodes(sourceFile, [previousSibling, initializer]);
            return this;
        }

        setInitializer(text: string, sourceFile: SourceFile = this.getSourceFileOrThrow()) {
            errors.throwIfNotStringOrWhitespace(text, nameof(text));

            if (this.hasInitializer())
                this.removeInitializer(sourceFile);

            insertStraight(sourceFile, this.getEnd(), this, ` = ${text}`);
            return this;
        }
    };
}
