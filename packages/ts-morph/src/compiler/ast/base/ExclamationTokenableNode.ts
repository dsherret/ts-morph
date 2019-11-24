import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { ExclamationTokenableNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { callBaseGetStructure } from "../callBaseGetStructure";

export type ExclamationTokenableNodeExtensionType = Node<ts.Node & { exclamationToken?: ts.ExclamationToken; }>;

export interface ExclamationTokenableNode {
    /**
     * If it has a exclamation token.
     */
    hasExclamationToken(): boolean;
    /**
     * Gets the exclamation token node or returns undefined if it doesn't exist.
     */
    getExclamationTokenNode(): Node<ts.ExclamationToken> | undefined;
    /**
     * Gets the exclamation token node or throws.
     */
    getExclamationTokenNodeOrThrow(): Node<ts.ExclamationToken>;
    /**
     * Sets if this node has a exclamation token.
     * @param value - If it should have a exclamation token or not.
     */
    setHasExclamationToken(value: boolean): this;
}

export function ExclamationTokenableNode<T extends Constructor<ExclamationTokenableNodeExtensionType>>(Base: T): Constructor<ExclamationTokenableNode> & T {
    return class extends Base implements ExclamationTokenableNode {
        hasExclamationToken() {
            return this.compilerNode.exclamationToken != null;
        }

        getExclamationTokenNode(): Node<ts.ExclamationToken> | undefined {
            return this._getNodeFromCompilerNodeIfExists(this.compilerNode.exclamationToken);
        }

        getExclamationTokenNodeOrThrow(): Node<ts.ExclamationToken> {
            return errors.throwIfNullOrUndefined(this.getExclamationTokenNode(), "Expected to find an exclamation token.");
        }

        setHasExclamationToken(value: boolean) {
            const exclamationTokenNode = this.getExclamationTokenNode();
            const hasExclamationToken = exclamationTokenNode != null;

            if (value === hasExclamationToken)
                return this;

            if (value) {
                if (Node.isQuestionTokenableNode(this))
                    this.setHasQuestionToken(false);

                const colonNode = this.getFirstChildByKind(SyntaxKind.ColonToken);
                if (colonNode == null)
                    throw new errors.InvalidOperationError("Cannot add an exclamation token to a node that does not have a type.");

                insertIntoParentTextRange({
                    insertPos: colonNode.getStart(),
                    parent: this,
                    newText: "!"
                });
            }
            else {
                removeChildren({ children: [exclamationTokenNode!] });
            }

            return this;
        }

        set(structure: Partial<ExclamationTokenableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.hasExclamationToken != null)
                this.setHasExclamationToken(structure.hasExclamationToken);

            return this;
        }

        getStructure() {
            return callBaseGetStructure<ExclamationTokenableNodeStructure>(Base.prototype, this, {
                hasExclamationToken: this.hasExclamationToken()
            });
        }
    };
}
