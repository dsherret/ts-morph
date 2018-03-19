import {ts, SyntaxKind} from "../../typescript";
import {Constructor} from "../../Constructor";
import * as errors from "../../errors";
import {insertIntoParentTextRange, removeChildren} from "../../manipulation";
import {QuestionTokenableNodeStructure} from "../../structures";
import {TypeGuards} from "../../utils";
import {callBaseFill} from "../callBaseFill";
import {Node} from "../common";

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
            return this.getNodeFromCompilerNodeIfExists(this.compilerNode.questionToken);
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
                if (TypeGuards.isExclamationTokenableNode(this))
                    this.setHasExclamationToken(false);

                const colonNode = this.getFirstChildByKindOrThrow(SyntaxKind.ColonToken);
                insertIntoParentTextRange({
                    insertPos: colonNode.getStart(),
                    parent: this,
                    newText: "?"
                });
            }
            else
                removeChildren({ children: [questionTokenNode!] });

            return this;
        }

        fill(structure: Partial<QuestionTokenableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.hasQuestionToken != null)
                this.setHasQuestionToken(structure.hasQuestionToken);

            return this;
        }
    };
}
