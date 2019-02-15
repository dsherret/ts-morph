import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { Node } from "../common";
import { ParameteredNode } from "./ParameteredNode";
import { ReturnTypedNode } from "./ReturnTypedNode";

export type SignatureDeclarationExtensionType = Node<ts.SignatureDeclaration>;

export interface SignatureDeclaration extends ParameteredNode, ReturnTypedNode {
}

export function SignatureDeclaration<T extends Constructor<SignatureDeclarationExtensionType>>(Base: T): Constructor<SignatureDeclaration> & T {
    return ReturnTypedNode(ParameteredNode(Base));
}
