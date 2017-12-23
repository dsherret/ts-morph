import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {Node} from "./../common";
import {JSDocableNode, ModifierableNode} from "./../base";
import {StatementedNode} from "./../statement";
import {SignaturedDeclaration} from "./SignaturedDeclaration";

export type FunctionLikeDeclarationExtensionType = Node<ts.FunctionLikeDeclaration>;

export interface FunctionLikeDeclaration extends JSDocableNode, SignaturedDeclaration, StatementedNode, ModifierableNode {
}

export function FunctionLikeDeclaration<T extends Constructor<FunctionLikeDeclarationExtensionType>>(Base: T): Constructor<FunctionLikeDeclaration> & T {
    return JSDocableNode(SignaturedDeclaration(StatementedNode(ModifierableNode(Base))));
}
