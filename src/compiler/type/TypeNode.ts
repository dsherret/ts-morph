import * as ts from "typescript";
import {Node} from "./../common";
import {Type} from "./../type";

export class TypeNode<T extends ts.TypeNode = ts.TypeNode> extends Node<T> {
}
