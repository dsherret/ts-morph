import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {insertIntoParent, removeNodes} from "./../../manipulation";
import {QuestionTokenableNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
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
            return this.compilerNode.questionToken != null;
        }

        getQuestionTokenNode(): Node<ts.QuestionToken> | undefined {
            if (this.compilerNode.questionToken == null)
                return undefined;
            return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.questionToken, this.sourceFile) as Node<ts.QuestionToken>;
        }

        setIsOptional(value: boolean) {
            const questionTokenNode = this.getQuestionTokenNode();
            const hasQuestionToken = questionTokenNode != null;

            if (value === hasQuestionToken)
                return this;

            if (value) {
                const colonNode = this.getFirstChildByKindOrThrow(ts.SyntaxKind.ColonToken);
                insertIntoParent({
                    insertPos: colonNode.getStart(),
                    childIndex: colonNode.getChildIndex(),
                    insertItemsCount: 1,
                    parent: this,
                    newText: "?"
                });
            }
            else
                removeNodes([questionTokenNode]);

            return this;
        }

        fill(structure: Partial<QuestionTokenableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.hasQuestionToken != null)
                this.setIsOptional(structure.hasQuestionToken);

            return this;
        }
    };
}
