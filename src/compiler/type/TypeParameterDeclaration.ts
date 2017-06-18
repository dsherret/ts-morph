import * as ts from "typescript";
import {NamedNode} from "./../base";
import {Node} from "./../common";
import {TypeNode} from "./TypeNode";

export const TypeParameterDeclarationBase = NamedNode(Node);
export class TypeParameterDeclaration extends TypeParameterDeclarationBase<ts.TypeParameterDeclaration> {
    /**
     * Gets the constraint node.
     */
    getConstraintNode(): TypeNode | undefined {
        return this.node.constraint == null ? undefined : this.factory.getTypeNode(this.node.constraint, this.sourceFile);
    }
}
