import { ts } from "@ts-morph/common";
import { Statement, StatementedNode } from "../statement";
export const ModuleBlockBase = StatementedNode(Statement);
export class ModuleBlock extends ModuleBlockBase<ts.ModuleBlock> {
}
