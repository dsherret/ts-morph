import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {SourceFile} from "./../file";

export type QuestionTokenableNodeExtensionType = Node<ts.Node & { questionToken?: ts.QuestionToken; }>;

export interface QuestionTokenableNode {
    /**
     * If it's optional.
     */
    isOptional(): boolean;
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
        isOptional() {
            return this.node.questionToken != null;
        }

        getQuestionTokenNode(): Node<ts.QuestionToken> | undefined {
            return this.node.questionToken == null ? undefined : (this.factory.getNodeFromCompilerNode(this.node.questionToken) as Node<ts.QuestionToken>);
        }

        setIsOptional(value: boolean, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            const questionTokenNode = this.getQuestionTokenNode();
            const isOptional = questionTokenNode != null;

            if (value === isOptional)
                return this;

            if (value) {
                const colonNode = this.getFirstChildByKind(ts.SyntaxKind.ColonToken);

                /* istanbul ignore if */
                if (colonNode == null)
                    throw new errors.NotImplementedError("Scenario not implemented. Could not find colon token.");

                sourceFile.insertText(colonNode.getStart(), "?");
            }
            else
                sourceFile.removeNodes(questionTokenNode);

            return this;
        }
    };
}
