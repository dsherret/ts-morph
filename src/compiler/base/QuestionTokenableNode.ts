import * as ts from "typescript";
import {Node} from "./../common";

export type QuestionTokenableNodeExtensionType = Node<ts.Node & { questionToken?: ts.QuestionToken; }>;

export interface QuestionTokenableNode {
    isOptional(): boolean;
    getQuestionTokenNode(): Node<ts.QuestionToken> | undefined;
}

export function QuestionTokenableNode<T extends Constructor<QuestionTokenableNodeExtensionType>>(Base: T): Constructor<QuestionTokenableNode> & T {
    return class extends Base implements QuestionTokenableNode {
        /**
         * If it's optional.
         */
        isOptional() {
            return this.node.questionToken != null;
        }

        /**
         * Gets the question token node.
         */
        getQuestionTokenNode(): Node<ts.QuestionToken> | undefined {
            return this.node.questionToken == null ? undefined : (this.factory.getNodeFromCompilerNode(this.node.questionToken) as Node<ts.QuestionToken>);
        }
    };
}
