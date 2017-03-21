import * as ts from "typescript";
import {Node} from "./../common";
import {Type} from "./../type/Type";
import {TypeNode} from "./../type/TypeNode";

export type ReturnTypedNodeExtensionReturnType = Node<ts.SignatureDeclaration>;

export interface ReturnTypedNode {
    getReturnType(): Type;
    getReturnTypeNode(): TypeNode | undefined;
}

export function ReturnTypedNode<T extends Constructor<ReturnTypedNodeExtensionReturnType>>(Base: T): Constructor<ReturnTypedNode> & T {
    return class extends Base implements ReturnTypedNode {
        /**
         * Gets the return type.
         */
        getReturnType() {
            const typeChecker = this.factory.getLanguageService().getProgram().getTypeChecker();
            const signature = typeChecker.getSignatureFromNode(this);
            return typeChecker.getReturnTypeOfSignature(signature);
        }

        /**
         * Gets the return type node or undefined if none exists.
         */
        getReturnTypeNode() {
            return this.node.type == null ? undefined : this.factory.getTypeNode(this.node.type);
        }
    };
}
