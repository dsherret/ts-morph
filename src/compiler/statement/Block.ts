import * as ts from "typescript";
import {Node} from "./../common";
import {TextInsertableNode} from "./../base";
import {StatementedNode} from "./StatementedNode";

export class Block extends TextInsertableNode(StatementedNode(Node))<ts.Block> {
}
