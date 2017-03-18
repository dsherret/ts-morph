import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportableNode, AmbientableNode} from "./../base";

export const ClassDeclarationBase = AmbientableNode(ExportableNode(NamedNode(Node)));
export class ClassDeclaration extends ClassDeclarationBase<ts.ClassDeclaration> {
}
