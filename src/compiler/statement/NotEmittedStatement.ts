import { ts } from "../../typescript";
import { Statement } from "./Statement";

export const NotEmittedStatementBase = Statement;
export class NotEmittedStatement extends NotEmittedStatementBase<ts.NotEmittedStatement> {
}
