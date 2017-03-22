import * as ts from "typescript";
import {ReturnTypedNode, TypeParameteredNode, ParameteredNode} from "./../base";
import {Node} from "./../common";

export type SignaturedDeclarationExtensionType = Node<ts.SignatureDeclaration>;

export interface SignaturedDeclaration extends ParameteredNode, ReturnTypedNode, TypeParameteredNode {
}

export function SignaturedDeclaration<T extends Constructor<SignaturedDeclarationExtensionType>>(Base: T): Constructor<SignaturedDeclaration> & T {
    return TypeParameteredNode(ReturnTypedNode(ParameteredNode(Base)));
}
