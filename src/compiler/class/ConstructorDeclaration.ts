import * as ts from "typescript";
import {removeFromBracesOrSourceFile} from "./../../manipulation";
import {Node} from "./../common";
import {ScopedNode, BodyableNode} from "./../base";
import {FunctionLikeDeclaration} from "./../function";

export const ConstructorDeclarationBase = ScopedNode(FunctionLikeDeclaration(BodyableNode(Node)));
export class ConstructorDeclaration extends ConstructorDeclarationBase<ts.ConstructorDeclaration> {
    /**
     * Remove the constructor.
     */
    remove() {
        removeFromBracesOrSourceFile({
            node: this
        });
    }
}
