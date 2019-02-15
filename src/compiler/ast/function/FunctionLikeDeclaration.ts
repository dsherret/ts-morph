import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { JSDocableNode, ModifierableNode, SignatureDeclaration, TypeParameteredNode } from "../base";
import { Node } from "../common";
import { StatementedNode } from "../statement";

export type FunctionLikeDeclarationExtensionType = Node<ts.FunctionLikeDeclaration>;

export interface FunctionLikeDeclaration extends JSDocableNode, TypeParameteredNode, SignatureDeclaration, StatementedNode, ModifierableNode {
}

export function FunctionLikeDeclaration<T extends Constructor<FunctionLikeDeclarationExtensionType>>(Base: T): Constructor<FunctionLikeDeclaration> & T {
    return JSDocableNode(TypeParameteredNode(SignatureDeclaration(StatementedNode(ModifierableNode(Base)))));
}
