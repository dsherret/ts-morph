import { ts } from "@ts-morph/common";
import { Statement } from "./Statement";

export const DebuggerStatementBase = Statement;
export class DebuggerStatement extends DebuggerStatementBase<ts.DebuggerStatement> {
}
