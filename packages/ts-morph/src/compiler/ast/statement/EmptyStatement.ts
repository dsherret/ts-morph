import { ts } from "@ts-morph/common";
import { Statement } from "./Statement";

export const EmptyStatementBase = Statement;
export class EmptyStatement extends EmptyStatementBase<ts.EmptyStatement> {
}
