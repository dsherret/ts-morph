import * as ts from "typescript";
import * as errors from "./../../errors";
import {replaceStraight} from "./../../manipulation";
import {Node} from "./../common";
import {Type} from "./../type/Type";
import {TypeNode} from "./../type/TypeNode";

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
     * Sets the return type of the node.
     * @param text - Text to set as the type.
     */
    setReturnType(text: string): this;
}

export function ReturnTypedNode<T extends Constructor<ReturnTypedNodeExtensionReturnType>>(Base: T): Constructor<ReturnTypedNode> & T {
    return class extends Base implements ReturnTypedNode {
        getReturnType() {
            const typeChecker = this.factory.getTypeChecker();
            const signature = typeChecker.getSignatureFromNode(this);
            return typeChecker.getReturnTypeOfSignature(signature);
        }

        getReturnTypeNode() {
            return this.node.type == null ? undefined : this.factory.getTypeNode(this.node.type, this.sourceFile);
        }

        setReturnType(text: string) {
            const returnTypeNode = this.getReturnTypeNode();
            if (returnTypeNode != null && returnTypeNode.getText() === text)
                return this;

            // get replace length of previous return type
            const colonToken = returnTypeNode == null ? undefined : returnTypeNode.getPreviousSibling();
            /* istanbul ignore if */
            if (colonToken != null && colonToken.getKind() !== ts.SyntaxKind.ColonToken)
                throw new errors.NotImplementedError("Expected a colon token to be the previous sibling of a return type.");
            const replaceLength = colonToken == null ? 0 : returnTypeNode!.getEnd() - colonToken.getPos();

            // insert new type
            const closeParenToken = this.getFirstChildByKindOrThrow(ts.SyntaxKind.CloseParenToken);
            replaceStraight(this.getSourceFile(), closeParenToken.getEnd(), replaceLength, `: ${text}`);

            return this;
        }
    };
}
