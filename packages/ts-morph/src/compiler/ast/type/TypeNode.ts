import { ts } from "@ts-morph/common";
import { Node } from "../common";

export class TypeNode<T extends ts.TypeNode = ts.TypeNode> extends Node<T> {
}
