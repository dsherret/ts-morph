import {ts} from "./../../typescript";
import {SignaturedDeclaration} from "./../base";
import {TypeNode} from "./TypeNode";

export class ConstructorTypeNode extends SignaturedDeclaration(TypeNode)<ts.ConstructorTypeNode> {
}
