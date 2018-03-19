import {ts} from "../../typescript";
import {Constructor} from "../../Constructor";
import {Node} from "../common";
import {JSDocableNode, ModifierableNode, TypeParameteredNode, SignaturedDeclaration} from "../base";
import {StatementedNode} from "../statement";

export type FunctionLikeDeclarationExtensionType = Node<ts.FunctionLikeDeclaration>;

export interface FunctionLikeDeclaration extends JSDocableNode, TypeParameteredNode, SignaturedDeclaration, StatementedNode, ModifierableNode {
}

export function FunctionLikeDeclaration<T extends Constructor<FunctionLikeDeclarationExtensionType>>(Base: T): Constructor<FunctionLikeDeclaration> & T {
    return JSDocableNode(TypeParameteredNode(SignaturedDeclaration(StatementedNode(ModifierableNode(Base)))));
}
