import * as ts from "typescript";
import {removeFromBracesOrSourceFile} from "./../../manipulation";
import {Node} from "./../common";
import {ScopedNode, BodyableNode} from "./../base";
import {FunctionLikeDeclaration, OverloadableNode} from "./../function";

export const ConstructorDeclarationBase = OverloadableNode(ScopedNode(FunctionLikeDeclaration(BodyableNode(Node))));
export class ConstructorDeclaration extends ConstructorDeclarationBase<ts.ConstructorDeclaration> {
    /**
     * Remove the constructor.
     */
    remove() {
        const nodesToRemove: Node[] = [this];
        if (this.isImplementation())
            nodesToRemove.push(...this.getOverloads());

        for (const nodeToRemove of nodesToRemove) {
            removeFromBracesOrSourceFile({
                node: nodeToRemove
            });
        }
    }
}
