import { ts } from "../../typescript";
import { TextInsertableNode } from "../base";
import { Statement } from "./Statement";
import { StatementedNode } from "./StatementedNode";

export const BlockBase = TextInsertableNode(StatementedNode(Statement));
export class Block extends BlockBase<ts.Block> {
}
