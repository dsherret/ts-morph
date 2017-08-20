import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {ReturnTypedNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import * as errors from "./../../errors";
import {insertIntoParent, removeChildren} from "./../../manipulation";
import {StringUtils} from "./../../utils";
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
    /**
     * Removes the return type.
     */
    removeReturnType(): this;
}

export function ReturnTypedNode<T extends Constructor<ReturnTypedNodeExtensionReturnType>>(Base: T): Constructor<ReturnTypedNode> & T {
    return class extends Base implements ReturnTypedNode {
        getReturnType() {
            const typeChecker = this.global.typeChecker;
            const signature = typeChecker.getSignatureFromNode(this)!; // should always return a signature
            return typeChecker.getReturnTypeOfSignature(signature);
        }

        getReturnTypeNode() {
            return this.compilerNode.type == null ? undefined : this.global.compilerFactory.getTypeNode(this.compilerNode.type, this.sourceFile);
        }

        setReturnType(text: string) {
            if (StringUtils.isNullOrWhitespace(text))
                return this.removeReturnType();

            const returnTypeNode = this.getReturnTypeNode();
            if (returnTypeNode != null && returnTypeNode.getText() === text)
                return this;

            // get replace length of previous return type
            const colonToken = returnTypeNode == null ? undefined : returnTypeNode.getPreviousSiblingIfKindOrThrow(ts.SyntaxKind.ColonToken);
            const replaceLength = colonToken == null ? 0 : returnTypeNode!.getEnd() - colonToken.getPos();

            // insert new type
            const closeParenToken = this.getFirstChildByKindOrThrow(ts.SyntaxKind.CloseParenToken);
            insertIntoParent({
                parent: this,
                childIndex: colonToken != null ? colonToken.getChildIndex() + 1 : closeParenToken.getChildIndex() + 1,
                insertItemsCount: colonToken != null ? 1 : 2,
                insertPos: colonToken != null ? colonToken.getEnd() : closeParenToken.getEnd(),
                newText: colonToken != null ? ` ${text}` : `: ${text}`,
                replacing: {
                    length: returnTypeNode == null ? 0 : returnTypeNode.getFullWidth(),
                    nodes: returnTypeNode == null ? [] : [returnTypeNode]
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
            const colonToken = returnTypeNode.getPreviousSiblingIfKindOrThrow(ts.SyntaxKind.ColonToken);

            removeChildren({ children: [colonToken, returnTypeNode], removePrecedingSpaces: true });
            return this;
        }
    };
}
