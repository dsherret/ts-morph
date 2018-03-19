import {ts} from "../../typescript";
import {Node} from "../common";
import {Type} from "./Type";

export class TypeNode<T extends ts.TypeNode = ts.TypeNode> extends Node<T> {
}
