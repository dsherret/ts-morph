import { Constructor } from "../../types";
import { ts } from "../../typescript";
import { Node } from "../common";
import { ParameteredNode } from "./ParameteredNode";
import { ReturnTypedNode } from "./ReturnTypedNode";

export type SignaturedDeclarationExtensionType = Node<ts.SignatureDeclaration>;

export interface SignaturedDeclaration extends ParameteredNode, ReturnTypedNode {
}

export function SignaturedDeclaration<T extends Constructor<SignaturedDeclarationExtensionType>>(Base: T): Constructor<SignaturedDeclaration> & T {
    return ReturnTypedNode(ParameteredNode(Base));
}
