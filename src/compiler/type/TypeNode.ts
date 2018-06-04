import { ts } from "../../typescript";
import { Node } from "../common";

export class TypeNode<T extends ts.TypeNode = ts.TypeNode> extends Node<T> {
}
