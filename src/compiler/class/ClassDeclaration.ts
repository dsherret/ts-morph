import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode} from "./../base";

export const ClassDeclarationBase = NamedNode(Node);
export class ClassDeclaration extends ClassDeclarationBase<ts.ClassDeclaration> {
}
