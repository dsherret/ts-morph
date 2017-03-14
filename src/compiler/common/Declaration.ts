import * as ts from "typescript";
import {Node} from "./Node";
import {DeclarationNamedNode} from "./../base";

export class Declaration<T extends ts.Declaration> extends DeclarationNamedNode(Node)<T> {
}
