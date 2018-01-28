import * as ts from "typescript";
import {Expression} from "./../expression";
import {IterationStatement} from "./IterationStatement";
import {VariableDeclarationList} from "./VariableDeclarationList";

export const ForInStatementBase = IterationStatement;
export class ForInStatement extends ForInStatementBase<ts.ForInStatement> {
    /**
     * Gets this for in statement's initializer.
     */
    getInitializer() {
        return this.getNodeFromCompilerNode<VariableDeclarationList | Expression>(this.compilerNode.initializer);
    }

    /**
     * Gets this for in statement's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode<Expression>(this.compilerNode.expression);
    }
}
