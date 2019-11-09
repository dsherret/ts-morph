import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren } from "../../../../manipulation";
import { InitializerExpressionableNodeStructure } from "../../../../structures";
import { Constructor, WriterFunction } from "../../../../types";
import { getTextFromStringOrWriter } from "../../../../utils";
import { callBaseSet } from "../../callBaseSet";
import { Node } from "../../common";
import { InitializerExpressionGetableNode } from "./InitializerExpressionGetableNode";
import { callBaseGetStructure } from "../../callBaseGetStructure";

export type InitializerExpressionableNodeExtensionType = Node<ts.Node & { initializer?: ts.Expression; }>;

export interface InitializerExpressionableNode extends InitializerExpressionGetableNode {
    /**
     * Removes the initializer.
     */
    removeInitializer(): this;
    /**
     * Sets the initializer.
     * @param text - Text or writer function to set for the initializer.
     */
    setInitializer(textOrWriterFunction: string | WriterFunction): this;
}

export function InitializerExpressionableNode<T extends Constructor<InitializerExpressionableNodeExtensionType>>(
    Base: T
): Constructor<InitializerExpressionableNode> & T {
    return apply(InitializerExpressionGetableNode(Base));
}

function apply<T extends Constructor<InitializerExpressionableNodeExtensionType & InitializerExpressionGetableNode>>(Base: T) {
    return class extends Base implements InitializerExpressionableNode {
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
            const text = getTextFromStringOrWriter(this._getWriterWithQueuedChildIndentation(), textOrWriterFunction);
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

        set(structure: Partial<InitializerExpressionableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.initializer != null)
                this.setInitializer(structure.initializer);
            else if (structure.hasOwnProperty(nameof(structure.initializer)))
                this.removeInitializer();

            return this;
        }

        getStructure() {
            const initializer = this.getInitializer();
            return callBaseGetStructure<InitializerExpressionableNodeStructure>(Base.prototype, this, {
                initializer: initializer ? initializer.getText() : undefined
            });
        }
    };
}
