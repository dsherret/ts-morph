import { ts } from "@ts-morph/common";
import { Expression } from "../expression";
import { Statement } from "./Statement";

export class WithStatement extends Statement<ts.WithStatement> {
    /**
     * Gets this with statement's expression.
     */
    getExpression(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.expression);
    }

    /**
     * Gets this with statement's statement.
     */
    getStatement(): Statement {
        return this._getNodeFromCompilerNode(this.compilerNode.statement);
    }
}
