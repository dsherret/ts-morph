import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, TypedNode} from "./../base";

// todo: type node should not be able to return undefined
export const TypeAliasDeclarationBase = TypedNode(NamedNode(Node));
export class TypeAliasDeclaration extends TypeAliasDeclarationBase<ts.TypeAliasDeclaration> {
}
