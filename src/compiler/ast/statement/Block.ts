import { ts } from "../../../typescript";
import { TextInsertableNode } from "../base";
import { Statement } from "./Statement";
import { StatementedNode } from "./StatementedNode";

const createBlockBase = <T extends typeof Statement>(ctor: T) => TextInsertableNode(StatementedNode(ctor));
export const BlockBase = createBlockBase(Statement);
export class Block extends BlockBase<ts.Block> {
}
