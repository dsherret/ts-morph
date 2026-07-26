import { ts } from "@ts-morph/common";
import { JSDocableNode } from "../base";
import { ExpressionedNode } from "../expression";
import { Statement } from "./Statement";

const createBase = <T extends typeof Statement>(ctor: T) => ExpressionedNode(JSDocableNode(ctor));
export const ExpressionStatementBase = createBase(Statement);
export class ExpressionStatement extends ExpressionStatementBase<ts.ExpressionStatement> {
}
