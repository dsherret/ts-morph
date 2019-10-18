import { ts } from "@ts-morph/common";
import { Expression } from "../expression";
import { IterationStatement } from "./IterationStatement";
import { VariableDeclarationList } from "../variable";

export const ForInStatementBase = IterationStatement;
export class ForInStatement extends ForInStatementBase<ts.ForInStatement> {
    /**
     * Gets this for in statement's initializer.
     */
    getInitializer(): VariableDeclarationList | Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.initializer);
    }

    /**
     * Gets this for in statement's expression.
     */
    getExpression(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.expression);
    }
}
