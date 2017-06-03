import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {PropertyNamedNode, StaticableNode, ScopedNode, DecoratableNode, BodiedNode} from "./../base";
import {FunctionLikeDeclaration} from "./../function";
import {AbstractableNode} from "./base";
import {SetAccessorDeclaration} from "./SetAccessorDeclaration";
import {ClassDeclaration} from "./ClassDeclaration";

export const GetAccessorDeclarationBase = DecoratableNode(AbstractableNode(ScopedNode(StaticableNode(FunctionLikeDeclaration(BodiedNode(PropertyNamedNode(Node)))))));
export class GetAccessorDeclaration extends GetAccessorDeclarationBase<ts.GetAccessorDeclaration> {
    /**
     * Gets the corresponding set accessor if one exists.
     */
    getSetAccessor(): SetAccessorDeclaration | undefined {
        const parent = this.getParentOrThrow() as ClassDeclaration;
        errors.throwIfNotSyntaxKind(parent, ts.SyntaxKind.ClassDeclaration, "Expected the parent to be a class declaration");

        const thisName = this.getName();
        for (const prop of parent.getInstanceProperties()) {
            if (prop.getName() === thisName && prop.getKind() === ts.SyntaxKind.SetAccessor)
                return prop as SetAccessorDeclaration;
        }

        return undefined;
    }
}
