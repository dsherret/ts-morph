import * as ts from "typescript";
import {Expression} from "./../common";
import {IterationStatement} from "./IterationStatement";
import {VariableDeclarationList} from "./VariableDeclarationList";

export const ForInStatementBase = IterationStatement;
export class ForInStatement extends ForInStatementBase<ts.ForInStatement> {
    /**
     * Gets this for in statement's initializer.
     */
    getInitializer() {
        return this.getNodeFromCompilerNode(this.compilerNode.initializer) as (VariableDeclarationList | Expression);
    }

    /**
     * Gets this for in statement's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode(this.compilerNode.expression) as Expression;
    }
}
