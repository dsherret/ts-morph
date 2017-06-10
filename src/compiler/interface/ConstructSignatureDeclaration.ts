import * as ts from "typescript";
import {Node} from "./../common";
import {DocumentationableNode} from "./../base";
import {SignaturedDeclaration} from "./../function";

export const ConstructSignatureBase = DocumentationableNode(SignaturedDeclaration(Node));
export class ConstructSignatureDeclaration extends ConstructSignatureBase<ts.ConstructSignatureDeclaration> {
}
