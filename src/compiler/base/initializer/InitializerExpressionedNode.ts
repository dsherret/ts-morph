import * as ts from "typescript";
import {Node, Expression} from "./../../common";

type ExtensionType = Node<ts.EnumMember>; // todo: why do I have to specify EnumMember here?

export interface InitializerExpressionedNode extends ExtensionType {
    hasInitializer(): boolean;
    getInitializer(): Expression | undefined;
    removeInitializer(): this;
    setInitializer(text: string): this;
}

export function InitializerExpressionedNode<T extends Constructor<ExtensionType>>(Base: T) {
    return class extends Base implements InitializerExpressionedNode {
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
        removeInitializer() {
            const initializer = this.getInitializer();
            if (initializer == null)
                return this;
            const previousSibling = initializer.getPreviousSibling();

            if (previousSibling == null || previousSibling.getKind() !== ts.SyntaxKind.FirstAssignment)
                throw this.getNotImplementedError();

            this.getRequiredSourceFile().removeNodes(previousSibling, initializer);
            return this;
        }

        /**
         * Sets the initializer.
         * @param text - New text to set for the initializer.
         */
        setInitializer(text: string) {
            if (this.hasInitializer())
                this.removeInitializer();

            this.getRequiredSourceFile().insertText(this.getEnd(), ` = ${text}`);
            return this;
        }
    };
}
