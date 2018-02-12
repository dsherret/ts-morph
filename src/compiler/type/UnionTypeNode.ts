import {ts} from "./../../typescript";
import {TypeNode} from "./TypeNode";

export class UnionTypeNode extends TypeNode<ts.UnionTypeNode> {
    /**
     * Gets the union type nodes.
     */
    getTypeNodes() {
        return this.compilerNode.types.map(t => this.getNodeFromCompilerNode<TypeNode>(t));
    }
}
