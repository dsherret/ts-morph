import { ts } from "../../typescript";
import { TypeNode } from "./TypeNode";
import { EntityName } from "../aliases";

export class TypeReferenceNode extends TypeNode<ts.TypeReferenceNode> {
    /**
     * Gets the type name.
     */
    getTypeName(): EntityName {
        return this.getNodeFromCompilerNode(this.compilerNode.typeName);
    }

    /**
     * Gets the type arguments.
     */
    getTypeArguments(): TypeNode[] {
        if (this.compilerNode.typeArguments == null)
            return [];
        return this.compilerNode.typeArguments.map(a => this.getNodeFromCompilerNode(a));
    }
}
