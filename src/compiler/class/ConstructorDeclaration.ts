import * as ts from "typescript";
import {removeFromBracesOrSourceFile} from "./../../manipulation";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import {ScopedNode, BodyableNode} from "./../base";
import {FunctionLikeDeclaration} from "./../function";

export const ConstructorDeclarationBase = ScopedNode(FunctionLikeDeclaration(BodyableNode(Node)));
export class ConstructorDeclaration extends ConstructorDeclarationBase<ts.ConstructorDeclaration> {
    /**
     * Remove the constructor.
     * @param sourceFile - Optional source file to help improve performance.
     */
    remove(sourceFile: SourceFile = this.getSourceFileOrThrow()) {
        removeFromBracesOrSourceFile({
            sourceFile,
            node: this
        });
    }
}
