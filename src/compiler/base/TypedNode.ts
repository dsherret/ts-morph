import * as ts from "typescript";
import {Node} from "./../common";
import {Type} from "./../type/Type";
import {TypeNode} from "./../type/TypeNode";

export type TypedNodeExtensionType = Node<ts.Node & { type?: ts.TypeNode; }>;

export interface TypedNode {
    getType(): Type;
    getTypeNode(): TypeNode | undefined;
}

export function TypedNode<T extends Constructor<TypedNodeExtensionType>>(Base: T): Constructor<TypedNode> & T {
    return class extends Base implements TypedNode {
        /**
         * Gets the type.
         */
        getType() {
            return this.factory.getLanguageService().getProgram().getTypeChecker().getTypeAtLocation(this);
        }

        /**
         * Gets the type node or undefined if none exists.
         */
        getTypeNode() {
            return this.node.type == null ? undefined : this.factory.getTypeNode(this.node.type);
        }

        // todo: add type node method
    };
}
