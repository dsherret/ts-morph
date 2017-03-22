import * as ts from "typescript";
import {Node} from "./../common";
import {TypeParameterDeclaration} from "./../type/TypeParameterDeclaration";

export type TypeParameteredNodeExtensionType = Node<ts.Node & { typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration>; }>;

export interface TypeParameteredNode {
    getTypeParameterDeclarations(): TypeParameterDeclaration[];
}

export function TypeParameteredNode<T extends Constructor<TypeParameteredNodeExtensionType>>(Base: T): Constructor<TypeParameteredNode> & T {
    return class extends Base implements TypeParameteredNode {
        /**
         * Gets the type parameters.
         */
        getTypeParameterDeclarations() {
            const typeParameters = (this.node.typeParameters || []) as ts.TypeParameterDeclaration[]; // why do I need this assert?
            return typeParameters.map(t => this.factory.getTypeParameterDeclaration(t));
        }

        // todo: add type parameter method
    };
}
