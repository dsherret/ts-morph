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
        return this.compilerNode.constraint == null ? undefined : this.global.compilerFactory.getTypeNode(this.compilerNode.constraint, this.sourceFile);
    }
}
