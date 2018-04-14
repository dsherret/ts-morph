import { ts } from "../../typescript";
import { Statement } from "./Statement";

export const DebuggerStatementBase = Statement;
export class DebuggerStatement extends DebuggerStatementBase<ts.DebuggerStatement> {
}
