import { ts } from "../../typescript";
import { Expression } from "../expression";
import { Statement } from "./Statement";

export const ThrowStatementBase = Statement;
export class ThrowStatement extends ThrowStatementBase<ts.ThrowStatement> {
    /**
     * Gets this do statement's expression.
     */
    getExpression(): Expression {
        return this.getNodeFromCompilerNode(this.compilerNode.expression);
    }
}
