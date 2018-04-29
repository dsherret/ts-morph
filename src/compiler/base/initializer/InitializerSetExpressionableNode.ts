import CodeBlockWriter from "code-block-writer";
import { ts, SyntaxKind } from "../../../typescript";
import { Constructor } from "../../../Constructor";
import * as errors from "../../../errors";
import { InitializerSetExpressionableNodeStructure } from "../../../structures";
import { callBaseFill } from "../../callBaseFill";
import { insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { getTextFromStringOrWriter } from "../../../utils";
import { Expression } from "../../expression";
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
     * @param text - New text to set for the initializer.
     */
    setInitializer(text: string): this;
    /**
     * Sets the initializer using a writer function.
     * @param writerFunction - Function to write the initializer with.
     */
    setInitializer(writerFunction: (writer: CodeBlockWriter) => void): this;
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

        setInitializer(textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
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
