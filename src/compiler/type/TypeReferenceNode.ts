import * as ts from "typescript";
import {TypeNode} from "./TypeNode";
import {EntityName} from "./../common";

export class TypeReferenceNode extends TypeNode<ts.TypeReferenceNode> {
    /**
     * Gets the type name.
     */
    getTypeName() {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.typeName, this.sourceFile) as EntityName;
    }

    /**
     * Gets the type arguments.
     */
    getTypeArguments() {
        if (this.compilerNode.typeArguments == null)
            return [];
        return this.compilerNode.typeArguments.map(a => this.global.compilerFactory.getNodeFromCompilerNode(a, this.sourceFile) as TypeNode);
    }
}
