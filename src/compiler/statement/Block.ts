import * as ts from "typescript";
import {Node} from "./../common";
import {TextInsertableNode} from "./../base";
import {StatementedNode} from "./StatementedNode";

export const BlockBase = TextInsertableNode(StatementedNode(Node));
export class Block extends BlockBase<ts.Block> {
}
