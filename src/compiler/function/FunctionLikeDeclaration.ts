import * as ts from "typescript";
import {Node} from "./../common";
import {DocumentationableNode, ModifierableNode, AsyncableNode} from "./../base";
import {StatementedNode} from "./../statement";
import {SignaturedDeclaration} from "./SignaturedDeclaration";

export type FunctionLikeDeclarationExtensionType = Node<ts.FunctionLikeDeclaration>;

export interface FunctionLikeDeclaration extends DocumentationableNode, AsyncableNode, SignaturedDeclaration, StatementedNode, ModifierableNode {
}

export function FunctionLikeDeclaration<T extends Constructor<FunctionLikeDeclarationExtensionType>>(Base: T): Constructor<FunctionLikeDeclaration> & T {
    return DocumentationableNode(AsyncableNode(SignaturedDeclaration(StatementedNode(ModifierableNode(Base)))));
}
