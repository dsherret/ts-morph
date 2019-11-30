import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { QuestionDotTokenableNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { callBaseGetStructure } from "../callBaseGetStructure";

export type QuestionDotTokenableNodeExtensionType = Node<ts.Node & { questionDotToken?: ts.QuestionDotToken; }>;

export interface QuestionDotTokenableNode {
    /**
     * If it has a question dot token.
     */
    hasQuestionDotToken(): boolean;
    /**
     * Gets the question dot token node or returns undefined if it doesn't exist.
     */
    getQuestionDotTokenNode(): Node<ts.QuestionDotToken> | undefined;
    /**
     * Gets the question dot token node or throws.
     */
    getQuestionDotTokenNodeOrThrow(): Node<ts.QuestionDotToken>;
    /**
     * Sets if this node has a question dot token.
     * @param value - If it should have a question dot token or not.
     */
    setHasQuestionDotToken(value: boolean): this;
}

export function QuestionDotTokenableNode<T extends Constructor<QuestionDotTokenableNodeExtensionType>>(Base: T): Constructor<QuestionDotTokenableNode> & T {
    return class extends Base implements QuestionDotTokenableNode {
        hasQuestionDotToken() {
            return this.compilerNode.questionDotToken != null;
        }

        getQuestionDotTokenNode(): Node<ts.QuestionDotToken> | undefined {
            return this._getNodeFromCompilerNodeIfExists(this.compilerNode.questionDotToken);
        }

        getQuestionDotTokenNodeOrThrow(): Node<ts.QuestionDotToken> {
            return errors.throwIfNullOrUndefined(this.getQuestionDotTokenNode(), "Expected to find a question dot token.");
        }

        setHasQuestionDotToken(value: boolean) {
            const questionDotTokenNode = this.getQuestionDotTokenNode();
            const hasQuestionDotToken = questionDotTokenNode != null;

            if (value === hasQuestionDotToken)
                return this;

            if (value) {
                if (Node.isPropertyAccessExpression(this))
                    this.getFirstChildByKindOrThrow(SyntaxKind.DotToken).replaceWithText("?.");
                else {
                    insertIntoParentTextRange({
                        insertPos: getInsertPos.call(this),
                        parent: this,
                        newText: "?."
                    });
                }
            }
            else {
                if (Node.isPropertyAccessExpression(this))
                    questionDotTokenNode!.replaceWithText(".");
                else
                    removeChildren({ children: [questionDotTokenNode!] });
            }

            return this;

            function getInsertPos(this: QuestionDotTokenableNode & Node) {
                if (Node.isCallExpression(this))
                    return this.getFirstChildByKindOrThrow(SyntaxKind.OpenParenToken).getStart();
                if (Node.isElementAccessExpression(this))
                    return this.getFirstChildByKindOrThrow(SyntaxKind.OpenBracketToken).getStart();
                errors.throwNotImplementedForSyntaxKindError(this.compilerNode.kind);
            }
        }

        set(structure: Partial<QuestionDotTokenableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.hasQuestionDotToken != null)
                this.setHasQuestionDotToken(structure.hasQuestionDotToken);

            return this;
        }

        getStructure() {
            return callBaseGetStructure<QuestionDotTokenableNodeStructure>(Base.prototype, this, {
                hasQuestionDotToken: this.hasQuestionDotToken()
            });
        }
    };
}
