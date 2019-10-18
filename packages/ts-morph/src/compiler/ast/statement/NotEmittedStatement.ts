import { ts } from "@ts-morph/common";
import { Statement } from "./Statement";

export const NotEmittedStatementBase = Statement;
export class NotEmittedStatement extends NotEmittedStatementBase<ts.NotEmittedStatement> {
}
