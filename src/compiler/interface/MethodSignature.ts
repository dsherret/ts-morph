import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, QuestionTokenableNode} from "./../base";
import {SignaturedDeclaration} from "./../function";

export const MethodSignatureBase = QuestionTokenableNode(SignaturedDeclaration(PropertyNamedNode(Node)));
export class MethodSignature extends MethodSignatureBase<ts.MethodSignature> {
}
