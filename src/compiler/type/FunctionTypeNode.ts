import {ts} from "./../../typescript";
import {SignaturedDeclaration, TypeParameteredNode} from "./../base";
import {TypeNode} from "./TypeNode";

export class FunctionTypeNode extends TypeParameteredNode(SignaturedDeclaration(TypeNode))<ts.FunctionTypeNode> {
}
