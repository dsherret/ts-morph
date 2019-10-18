import { ts } from "@ts-morph/common";
import { TextInsertableNode } from "../base";
import { Statement } from "./Statement";
import { StatementedNode } from "./StatementedNode";

export const BlockBase = TextInsertableNode(StatementedNode(Statement));
export class Block extends BlockBase<ts.Block> {
}
