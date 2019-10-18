import { errors, StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { ReturnTypedNodeStructure } from "../../../structures";
import { Constructor, WriterFunction } from "../../../types";
import { getTextFromStringOrWriter } from "../../../utils";
import { Signature } from "../../symbols";
import { Type } from "../../types";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { TypeNode } from "../type/TypeNode";
import { callBaseGetStructure } from "../callBaseGetStructure";

export type ReturnTypedNodeExtensionType = Node<ts.SignatureDeclaration>;

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
     * @param textOrWriterFunction - Text or writer function to set the return type with.
     */
    setReturnType(textOrWriterFunction: string | WriterFunction): this;
    /**
     * Removes the return type.
     */
    removeReturnType(): this;
    /**
     * Gets the signature of the node from the type checker.
     */
    getSignature(): Signature;
}

export function ReturnTypedNode<T extends Constructor<ReturnTypedNodeExtensionType>>(Base: T): Constructor<ReturnTypedNode> & T {
    return class extends Base implements ReturnTypedNode {
        getReturnType() {
            return this.getSignature().getReturnType();
        }

        getReturnTypeNode() {
            return this._getNodeFromCompilerNodeIfExists(this.compilerNode.type);
        }

        getReturnTypeNodeOrThrow() {
            return errors.throwIfNullOrUndefined(this.getReturnTypeNode(), "Expected to find a return type node.");
        }

        setReturnType(textOrWriterFunction: string | WriterFunction) {
            const text = getTextFromStringOrWriter(this._getWriterWithQueuedChildIndentation(), textOrWriterFunction);
            if (StringUtils.isNullOrWhitespace(text))
                return this.removeReturnType();

            const returnTypeNode = this.getReturnTypeNode();
            if (returnTypeNode != null) {
                if (returnTypeNode.getText() !== text)
                    returnTypeNode.replaceWithText(text);
                return this;
            }

            // insert new type
            insertIntoParentTextRange({
                parent: this,
                insertPos: getEndNode(this).getEnd(),
                newText: `: ${text}`
            });

            return this;

            function getEndNode(thisNode: Node) {
                if (thisNode.getKind() === SyntaxKind.IndexSignature)
                    return thisNode.getFirstChildByKindOrThrow(SyntaxKind.CloseBracketToken);
                return thisNode.getFirstChildByKindOrThrow(SyntaxKind.CloseParenToken);
            }
        }

        removeReturnType() {
            const returnTypeNode = this.getReturnTypeNode();
            if (returnTypeNode == null)
                return this;

            const colonToken = returnTypeNode.getPreviousSiblingIfKindOrThrow(SyntaxKind.ColonToken);
            removeChildren({ children: [colonToken, returnTypeNode], removePrecedingSpaces: true });
            return this;
        }

        getSignature() {
            const signature = this._context.typeChecker.getSignatureFromNode(this);
            if (signature == null)
                throw new errors.NotImplementedError("Expected the node to have a signature.");
            return signature;
        }

        set(structure: Partial<ReturnTypedNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.returnType != null)
                this.setReturnType(structure.returnType);
            else if (structure.hasOwnProperty(nameof(structure.returnType)))
                this.removeReturnType();

            return this;
        }

        getStructure() {
            const returnTypeNode = this.getReturnTypeNode();
            return callBaseGetStructure<ReturnTypedNodeStructure>(Base.prototype, this, {
                returnType: returnTypeNode ? returnTypeNode.getText({ trimLeadingIndentation: true }) : undefined
            });
        }
    };
}
