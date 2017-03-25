import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, QuestionTokenableNode, DocumentationableNode} from "./../base";
import {SignaturedDeclaration} from "./../function";

export const MethodSignatureBase = DocumentationableNode(QuestionTokenableNode(SignaturedDeclaration(PropertyNamedNode(Node))));
export class MethodSignature extends MethodSignatureBase<ts.MethodSignature> {
}
