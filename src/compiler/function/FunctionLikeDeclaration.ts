import * as ts from "typescript";
import {Node} from "./../common";
import {DocumentationableNode, ModifierableNode, AsyncableNode, GeneratorableNode} from "./../base";
import {StatementedNode} from "./../statement";
import {SignaturedDeclaration} from "./SignaturedDeclaration";

export type FunctionLikeDeclarationExtensionType = Node<ts.FunctionLikeDeclaration>;

export interface FunctionLikeDeclaration extends DocumentationableNode, AsyncableNode, GeneratorableNode, SignaturedDeclaration, StatementedNode, ModifierableNode {
}

export function FunctionLikeDeclaration<T extends Constructor<FunctionLikeDeclarationExtensionType>>(Base: T): Constructor<FunctionLikeDeclaration> & T {
    return DocumentationableNode(AsyncableNode(GeneratorableNode(SignaturedDeclaration(StatementedNode(ModifierableNode(Base))))));
}
