import {ts} from "../../typescript";
import {TypeElementMemberedNode} from "../base";
import {TypeNode} from "./TypeNode";
import {TypeElementTypes} from "../aliases";

export class TypeLiteralNode extends TypeElementMemberedNode(TypeNode)<ts.TypeLiteralNode> {
}
