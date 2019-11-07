import { ts } from "@ts-morph/common";
import { TextInsertableNode } from "../base";
import { Statement } from "./Statement";
import { StatementedNode } from "./StatementedNode";

const createBase = <T extends typeof Statement>(ctor: T) => TextInsertableNode(StatementedNode(ctor));
export const BlockBase = createBase(Statement);
export class Block extends BlockBase<ts.Block> {
}
