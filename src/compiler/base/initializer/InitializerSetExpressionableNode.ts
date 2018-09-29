import * as errors from "../../../errors";
import { insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { InitializerSetExpressionableNodeStructure } from "../../../structures";
import { Constructor, WriterFunction } from "../../../types";
import { SyntaxKind, ts } from "../../../typescript";
import { getTextFromStringOrWriter } from "../../../utils";
import { callBaseSet } from "../../callBaseSet";
import { Node } from "../../common";
import { InitializerGetExpressionableNode } from "./InitializerGetExpressionableNode";
import { callBaseGetStructure } from "../../callBaseGetStructure";

export type InitializerSetExpressionableNodeExtensionType = Node<ts.Node & { initializer?: ts.Expression; }> & InitializerGetExpressionableNode;
/** @deprecated */
export type InitializerSetExpressionableExtensionType = InitializerSetExpressionableNodeExtensionType;

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

export function InitializerSetExpressionableNode<T extends Constructor<InitializerSetExpressionableNodeExtensionType>>(Base: T): Constructor<InitializerSetExpressionableNode> & T {
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
            errors.throwIfWhitespaceOrNotString(text, nameof(textOrWriterFunction));

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

        set(structure: Partial<InitializerSetExpressionableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.initializer != null)
                this.setInitializer(structure.initializer);
            else if (structure.hasOwnProperty(nameof(structure.initializer)))
                this.removeInitializer();

            return this;
        }

        getStructure() {
            const initializer = this.getInitializer();
            return callBaseGetStructure<InitializerSetExpressionableNodeStructure>(Base.prototype, this, {
                initializer: initializer ? initializer.getText() : undefined
            });
        }
    };
}
