import * as ts from "typescript";
import * as errors from "./../../errors";
import {insertStraight, removeNodes} from "./../../manipulation";
import {Node} from "./../common";
import {SourceFile} from "./../file";

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
     * @param sourceFile - Optional source file to help improve performance.
     */
    setIsOptional(value: boolean, sourceFile?: SourceFile): this;
}

export function QuestionTokenableNode<T extends Constructor<QuestionTokenableNodeExtensionType>>(Base: T): Constructor<QuestionTokenableNode> & T {
    return class extends Base implements QuestionTokenableNode {
        hasQuestionToken() {
            return this.node.questionToken != null;
        }

        getQuestionTokenNode(): Node<ts.QuestionToken> | undefined {
            return this.node.questionToken == null ? undefined : (this.factory.getNodeFromCompilerNode(this.node.questionToken) as Node<ts.QuestionToken>);
        }

        setIsOptional(value: boolean, sourceFile: SourceFile = this.getSourceFileOrThrow()) {
            const questionTokenNode = this.getQuestionTokenNode();
            const hasQuestionToken = questionTokenNode != null;

            if (value === hasQuestionToken)
                return this;

            if (value) {
                const colonNode = this.getFirstChildByKindOrThrow(ts.SyntaxKind.ColonToken, sourceFile);
                insertStraight(sourceFile, colonNode.getStart(), this, "?");
            }
            else
                removeNodes(sourceFile, [questionTokenNode]);

            return this;
        }
    };
}
