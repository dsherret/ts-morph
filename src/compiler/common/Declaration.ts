import * as ts from "typescript";
import {Node} from "./Node";
import {DeclarationNamedNode} from "./../base";

export const DeclarationBase = DeclarationNamedNode(Node);
export class Declaration<T extends ts.Declaration> extends DeclarationBase<T> {
}
