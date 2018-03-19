import {ts, SyntaxKind} from "../../typescript";
import {Constructor} from "../../Constructor";
import {ReturnTypedNodeStructure} from "../../structures";
import {callBaseFill} from "../callBaseFill";
import * as errors from "../../errors";
import {removeChildren, insertIntoParentTextRange} from "../../manipulation";
import {StringUtils} from "../../utils";
import {Node} from "../common";
import {Type} from "../type/Type";
import {TypeNode} from "../type/TypeNode";

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
            return signature.getReturnType();
        }

        getReturnTypeNode() {
            return this.getNodeFromCompilerNodeIfExists<TypeNode>(this.compilerNode.type);
        }

        getReturnTypeNodeOrThrow() {
            return errors.throwIfNullOrUndefined(this.getReturnTypeNode(), "Expected to find a return type node.");
        }

        setReturnType(text: string) {
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
