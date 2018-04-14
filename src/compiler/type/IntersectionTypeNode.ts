import { ts } from "../../typescript";
import { TypeNode } from "./TypeNode";

export class IntersectionTypeNode extends TypeNode<ts.IntersectionTypeNode> {
    /**
     * Gets the intersection type nodes.
     */
    getTypeNodes() {
        return this.compilerNode.types.map(t => this.getNodeFromCompilerNode<TypeNode>(t));
    }
}
