import { ts } from "../../../typescript";
import { Expression } from "../expression";
import { Statement } from "./Statement";

export class IfStatement extends Statement<ts.IfStatement> {
    /**
     * Gets this if statement's expression.
     */
    getExpression(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.expression);
    }

    /**
     * Gets this if statement's then statement.
     */
    getThenStatement(): Statement {
        return this._getNodeFromCompilerNode(this.compilerNode.thenStatement);
    }

    /**
     * Gets this if statement's else statement.
     */
    getElseStatement(): Statement | undefined {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.elseStatement);
    }
}
