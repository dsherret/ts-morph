import * as ts from "typescript";
import * as errors from "./../../../errors";
import {Node, Expression} from "./../../common";
import {SourceFile} from "./../../file";

export type InitializerExpressionedExtensionType = Node<ts.Node & { initializer?: ts.Expression; }>;

export interface InitializerExpressionableNode {
    hasInitializer(): boolean;
    getInitializer(): Expression | undefined;
    removeInitializer(sourceFile?: SourceFile): this;
    setInitializer(text: string, sourceFile?: SourceFile): this;
}

export function InitializerExpressionableNode<T extends Constructor<InitializerExpressionedExtensionType>>(Base: T): Constructor<InitializerExpressionableNode> & T {
    return class extends Base implements InitializerExpressionableNode {
        /**
         * Gets if node has an initializer.
         */
        hasInitializer() {
            return this.node.initializer != null;
        }

        /**
         * Gets the initializer.
         */
        getInitializer() {
            return this.node.initializer == null ? undefined : this.factory.getExpression(this.node.initializer);
        }

        /**
         * Removes the initailizer.
         */
        removeInitializer(sourceFile?: SourceFile) {
            const initializer = this.getInitializer();
            if (initializer == null)
                return this;
            const previousSibling = initializer.getPreviousSibling();

            /* istanbul ignore if */
            if (previousSibling == null || previousSibling.getKind() !== ts.SyntaxKind.FirstAssignment)
                throw this.getNotImplementedError();

            sourceFile = sourceFile || this.getRequiredSourceFile();
            sourceFile.removeNodes(previousSibling, initializer);
            return this;
        }

        /**
         * Sets the initializer.
         * @param text - New text to set for the initializer.
         */
        setInitializer(text: string, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            errors.throwIfNotStringOrWhitespace(text, nameof(text));

            if (this.hasInitializer())
                this.removeInitializer(sourceFile);

            sourceFile.insertText(this.getEnd(), ` = ${text}`);
            return this;
        }
    };
}
