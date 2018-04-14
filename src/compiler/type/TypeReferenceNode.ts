import { ts } from "../../typescript";
import { TypeNode } from "./TypeNode";
import { EntityName } from "../aliases";

export class TypeReferenceNode extends TypeNode<ts.TypeReferenceNode> {
    /**
     * Gets the type name.
     */
    getTypeName() {
        return this.getNodeFromCompilerNode<EntityName>(this.compilerNode.typeName);
    }

    /**
     * Gets the type arguments.
     */
    getTypeArguments() {
        if (this.compilerNode.typeArguments == null)
            return [];
        return this.compilerNode.typeArguments.map(a => this.getNodeFromCompilerNode<TypeNode>(a));
    }
}
