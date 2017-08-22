import * as ts from "typescript";
import {Node} from "./Node";
import {DeclarationNamedNode} from "./../base";

// todo: this doesn't seem to be used anywhere

export const NamedDeclarationBase = DeclarationNamedNode(Node);
export class NamedDeclaration<T extends ts.NamedDeclaration = ts.NamedDeclaration> extends NamedDeclarationBase<T> {
}
