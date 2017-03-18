import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportedNode} from "./../base";

export const ClassDeclarationBase = ExportedNode(NamedNode(Node));
export class ClassDeclaration extends ClassDeclarationBase<ts.ClassDeclaration> {
}
