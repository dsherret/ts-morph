import * as ts from "typescript";
import * as errors from "./../../errors";
import {removeClassMember} from "./../../manipulation";
import {Node} from "./../common";
import {PropertyNamedNode, StaticableNode, ScopedNode, DecoratableNode, BodiedNode, TextInsertableNode} from "./../base";
import {FunctionLikeDeclaration} from "./../function";
import {AbstractableNode} from "./base";
import {SetAccessorDeclaration} from "./SetAccessorDeclaration";
import {ClassDeclaration} from "./ClassDeclaration";

export const GetAccessorDeclarationBase = TextInsertableNode(DecoratableNode(AbstractableNode(ScopedNode(StaticableNode(
    BodiedNode(FunctionLikeDeclaration(PropertyNamedNode(Node)))
)))));
export class GetAccessorDeclaration extends GetAccessorDeclarationBase<ts.GetAccessorDeclaration> {
    /**
     * Gets the corresponding set accessor if one exists.
     */
    getSetAccessor(): SetAccessorDeclaration | undefined {
        const parent = this.getParentIfKindOrThrow(ts.SyntaxKind.ClassDeclaration) as ClassDeclaration;
        const thisName = this.getName();
        for (const prop of parent.getInstanceProperties()) {
            if (prop.getName() === thisName && prop.getKind() === ts.SyntaxKind.SetAccessor)
                return prop as SetAccessorDeclaration;
        }

        return undefined;
    }

    /**
     * Removes the get accessor.
     */
    remove() {
        removeClassMember(this);
    }
}
