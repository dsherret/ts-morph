import * as ts from "typescript";
import {TypeNode} from "./TypeNode";
import {EntityName} from "./../common";

export class TypeReferenceNode extends TypeNode<ts.TypeReferenceNode> {
    /**
     * Gets the type name.
     */
    getTypeName() {
        return this.getNodeFromCompilerNode(this.compilerNode.typeName) as EntityName;
    }

    /**
     * Gets the type arguments.
     */
    getTypeArguments() {
        if (this.compilerNode.typeArguments == null)
            return [];
        return this.compilerNode.typeArguments.map(a => this.getNodeFromCompilerNode(a) as TypeNode);
    }
}
