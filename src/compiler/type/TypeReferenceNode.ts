import { ts } from "../../typescript";
import { EntityName } from "../aliases";
import { TypeNode } from "./TypeNode";

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
