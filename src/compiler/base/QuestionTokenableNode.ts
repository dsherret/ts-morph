import * as ts from "typescript";
import * as errors from "./../../errors";
import {insertStraight, removeNodes} from "./../../manipulation";
import {Node} from "./../common";

export type QuestionTokenableNodeExtensionType = Node<ts.Node & { questionToken?: ts.QuestionToken; }>;

export interface QuestionTokenableNode {
    /**
     * If it has a question token.
     */
    hasQuestionToken(): boolean;
    /**
     * Gets the question token node.
     */
    getQuestionTokenNode(): Node<ts.QuestionToken> | undefined;
    /**
     * Sets if this node is optional.
     * @param value - If optional or not.
     */
    setIsOptional(value: boolean): this;
}

export function QuestionTokenableNode<T extends Constructor<QuestionTokenableNodeExtensionType>>(Base: T): Constructor<QuestionTokenableNode> & T {
    return class extends Base implements QuestionTokenableNode {
        hasQuestionToken() {
            return this.node.questionToken != null;
        }

        getQuestionTokenNode(): Node<ts.QuestionToken> | undefined {
            return this.node.questionToken == null ? undefined : (this.factory.getNodeFromCompilerNode(this.node.questionToken, this.sourceFile) as Node<ts.QuestionToken>);
        }

        setIsOptional(value: boolean) {
            const questionTokenNode = this.getQuestionTokenNode();
            const hasQuestionToken = questionTokenNode != null;

            if (value === hasQuestionToken)
                return this;

            if (value) {
                const colonNode = this.getFirstChildByKindOrThrow(ts.SyntaxKind.ColonToken);
                insertStraight(this.getSourceFile(), colonNode.getStart(), this, "?");
            }
            else
                removeNodes(this.getSourceFile(), [questionTokenNode]);

            return this;
        }
    };
}
