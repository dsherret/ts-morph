import * as errors from "../../../errors";
import { insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { InitializerSetExpressionableNodeStructure } from "../../../structures";
import { Constructor, WriterFunction } from "../../../types";
import { SyntaxKind, ts } from "../../../typescript";
import { getTextFromStringOrWriter } from "../../../utils";
import { callBaseFill } from "../../callBaseFill";
import { Node } from "../../common";
import { InitializerGetExpressionableNode } from "./InitializerGetExpressionableNode";

export type InitializerSetExpressionableExtensionType = Node<ts.Node & { initializer?: ts.Expression; }> & InitializerGetExpressionableNode;

export interface InitializerSetExpressionableNode {
    /**
     * Removes the initailizer.
     */
    removeInitializer(): this;
    /**
     * Sets the initializer.
     * @param text - Text or writer function to set for the initializer.
     */
    setInitializer(textOrWriterFunction: string | WriterFunction): this;
}

export function InitializerSetExpressionableNode<T extends Constructor<InitializerSetExpressionableExtensionType>>(Base: T): Constructor<InitializerSetExpressionableNode> & T {
    return class extends Base implements InitializerSetExpressionableNode {
        removeInitializer() {
            const initializer = this.getInitializer();
            if (initializer == null)
                return this;
            const previousSibling = initializer.getPreviousSiblingIfKindOrThrow(SyntaxKind.EqualsToken);

            removeChildren({
                children: [previousSibling, initializer],
                removePrecedingSpaces: true
            });
            return this;
        }

        setInitializer(textOrWriterFunction: string | WriterFunction) {
            const text = getTextFromStringOrWriter(this.getWriterWithQueuedChildIndentation(), textOrWriterFunction);
            errors.throwIfNotStringOrWhitespace(text, nameof(textOrWriterFunction));

            if (this.hasInitializer())
                this.removeInitializer();

            const semiColonToken = this.getLastChildIfKind(SyntaxKind.SemicolonToken);

            insertIntoParentTextRange({
                insertPos: semiColonToken != null ? semiColonToken.getPos() : this.getEnd(),
                parent: this,
                newText: ` = ${text}`
            });
            return this;
        }

        fill(structure: Partial<InitializerSetExpressionableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.initializer != null)
                this.setInitializer(structure.initializer);

            return this;
        }
    };
}
