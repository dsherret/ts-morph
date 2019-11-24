import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { QuestionTokenableNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { callBaseGetStructure } from "../callBaseGetStructure";

export type QuestionTokenableNodeExtensionType = Node<ts.Node & { questionToken?: ts.QuestionToken; }>;

export interface QuestionTokenableNode {
    /**
     * If it has a question token.
     */
    hasQuestionToken(): boolean;
    /**
     * Gets the question token node or returns undefined if it doesn't exist.
     */
    getQuestionTokenNode(): Node<ts.QuestionToken> | undefined;
    /**
     * Gets the question token node or throws.
     */
    getQuestionTokenNodeOrThrow(): Node<ts.QuestionToken>;
    /**
     * Sets if this node has a question token.
     * @param value - If it should have a question token or not.
     */
    setHasQuestionToken(value: boolean): this;
}

export function QuestionTokenableNode<T extends Constructor<QuestionTokenableNodeExtensionType>>(Base: T): Constructor<QuestionTokenableNode> & T {
    return class extends Base implements QuestionTokenableNode {
        hasQuestionToken() {
            return this.compilerNode.questionToken != null;
        }

        getQuestionTokenNode(): Node<ts.QuestionToken> | undefined {
            return this._getNodeFromCompilerNodeIfExists(this.compilerNode.questionToken);
        }

        getQuestionTokenNodeOrThrow(): Node<ts.QuestionToken> {
            return errors.throwIfNullOrUndefined(this.getQuestionTokenNode(), "Expected to find a question token.");
        }

        setHasQuestionToken(value: boolean) {
            const questionTokenNode = this.getQuestionTokenNode();
            const hasQuestionToken = questionTokenNode != null;

            if (value === hasQuestionToken)
                return this;

            if (value) {
                if (Node.isExclamationTokenableNode(this))
                    this.setHasExclamationToken(false);

                insertIntoParentTextRange({
                    insertPos: getInsertPos.call(this),
                    parent: this,
                    newText: "?"
                });
            }
            else {
                removeChildren({ children: [questionTokenNode!] });
            }

            return this;

            function getInsertPos(this: QuestionTokenableNode & Node) {
                if (Node.hasName(this))
                    return this.getNameNode().getEnd();

                const colonNode = this.getFirstChildByKind(SyntaxKind.ColonToken);
                if (colonNode != null)
                    return colonNode.getStart();

                const semicolonToken = this.getLastChildByKind(SyntaxKind.SemicolonToken);
                if (semicolonToken != null)
                    return semicolonToken.getStart();

                return this.getEnd();
            }
        }

        set(structure: Partial<QuestionTokenableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.hasQuestionToken != null)
                this.setHasQuestionToken(structure.hasQuestionToken);

            return this;
        }

        getStructure() {
            return callBaseGetStructure<QuestionTokenableNodeStructure>(Base.prototype, this, {
                hasQuestionToken: this.hasQuestionToken()
            });
        }
    };
}
