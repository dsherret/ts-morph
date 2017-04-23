import * as ts from "typescript";
import {Node} from "./../common";

export class TypeNodeBase<T extends ts.TypeNode> extends Node<T> {
}

export class TypeNode extends TypeNodeBase<ts.TypeNode> {
}
