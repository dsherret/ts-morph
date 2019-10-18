import { ts } from "@ts-morph/common";
import { Constructor } from "../../../types";
import { JSDocableNode, ModifierableNode, SignaturedDeclaration, TypeParameteredNode } from "../base";
import { Node } from "../common";
import { StatementedNode } from "../statement";

export type FunctionLikeDeclarationExtensionType = Node<ts.FunctionLikeDeclaration>;

export interface FunctionLikeDeclaration extends JSDocableNode, TypeParameteredNode, SignaturedDeclaration, StatementedNode, ModifierableNode {
}

export function FunctionLikeDeclaration<T extends Constructor<FunctionLikeDeclarationExtensionType>>(Base: T): Constructor<FunctionLikeDeclaration> & T {
    return JSDocableNode(TypeParameteredNode(SignaturedDeclaration(StatementedNode(ModifierableNode(Base)))));
}
