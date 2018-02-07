import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {ReturnTypedNode} from "./ReturnTypedNode";
import {ParameteredNode} from "./ParameteredNode";
import {Node} from "./../common";

export type SignaturedDeclarationExtensionType = Node<ts.SignatureDeclaration>;

export interface SignaturedDeclaration extends ParameteredNode, ReturnTypedNode {
}

export function SignaturedDeclaration<T extends Constructor<SignaturedDeclarationExtensionType>>(Base: T): Constructor<SignaturedDeclaration> & T {
    return ReturnTypedNode(ParameteredNode(Base));
}
