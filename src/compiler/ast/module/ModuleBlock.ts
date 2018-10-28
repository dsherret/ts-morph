import { Statement, StatementedNode } from "../statement";
import { ts } from "../../../typescript";

export const ModuleBlockBase = StatementedNode(Statement);
export class ModuleBlock extends ModuleBlockBase<ts.ModuleBlock> {
}
