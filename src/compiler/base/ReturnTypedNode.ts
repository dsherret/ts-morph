import * as errors from "../../errors";
import { insertIntoParentTextRange, removeChildren } from "../../manipulation";
import { ReturnTypedNodeStructure } from "../../structures";
import { Constructor, WriterFunction } from "../../types";
import { SyntaxKind, ts } from "../../typescript";
import { getTextFromStringOrWriter, StringUtils } from "../../utils";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { Type } from "../type/Type";
import { TypeNode } from "../type/TypeNode";

export type ReturnTypedNodeExtensionReturnType = Node<ts.SignatureDeclaration>;

export interface ReturnTypedNode {
    /**
     * Gets the return type.
     */
    getReturnType(): Type;
    /**
     * Gets the return type node or undefined if none exists.
     */
    getReturnTypeNode(): TypeNode | undefined;
    /**
     * Gets the return type node or throws if none exists.
     */
    getReturnTypeNodeOrThrow(): TypeNode;
    /**
     * Sets the return type of the node.
     * @param writerFunction - Writer function to set the return type with.
     */
    setReturnType(writerFunction: WriterFunction): this;
    /**
     * Sets the return type of the node.
     * @param text - Text to set as the type.
     */
    setReturnType(text: string): this;
    /**
     * Removes the return type.
     */
    removeReturnType(): this;
}

export function ReturnTypedNode<T extends Constructor<ReturnTypedNodeExtensionReturnType>>(Base: T): Constructor<ReturnTypedNode> & T {
    return class extends Base implements ReturnTypedNode {
        getReturnType() {
            const typeChecker = this.context.typeChecker;
            const signature = typeChecker.getSignatureFromNode(this)!; // should always return a signature
            return signature.getReturnType();
        }

        getReturnTypeNode() {
            return this.getNodeFromCompilerNodeIfExists(this.compilerNode.type);
        }

        getReturnTypeNodeOrThrow() {
            return errors.throwIfNullOrUndefined(this.getReturnTypeNode(), "Expected to find a return type node.");
        }

        setReturnType(textOrWriterFunction: string | WriterFunction) {
            const text = getTextFromStringOrWriter(this.getWriterWithQueuedChildIndentation(), textOrWriterFunction);
            if (StringUtils.isNullOrWhitespace(text))
                return this.removeReturnType();

            const returnTypeNode = this.getReturnTypeNode();
            if (returnTypeNode != null && returnTypeNode.getText() === text)
                return this;

            // insert new type
            insertIntoParentTextRange({
                parent: this,
                insertPos: returnTypeNode != null ? returnTypeNode.getStart() : this.getFirstChildByKindOrThrow(SyntaxKind.CloseParenToken).getEnd(),
                newText: returnTypeNode != null ? text : `: ${text}`,
                replacing: {
                    textLength: returnTypeNode == null ? 0 : returnTypeNode.getWidth()
                }
            });

            return this;
        }

        fill(structure: Partial<ReturnTypedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.returnType != null)
                this.setReturnType(structure.returnType);

            return this;
        }

        removeReturnType() {
            const returnTypeNode = this.getReturnTypeNode();
            if (returnTypeNode == null)
                return this;

            const colonToken = returnTypeNode.getPreviousSiblingIfKindOrThrow(SyntaxKind.ColonToken);
            removeChildren({ children: [colonToken, returnTypeNode], removePrecedingSpaces: true });
            return this;
        }
    };
}
