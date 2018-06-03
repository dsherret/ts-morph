import { ts } from "../../typescript";
import { Expression } from "../expression";
import { IterationStatement } from "./IterationStatement";
import { VariableDeclarationList } from "./VariableDeclarationList";
import { AwaitableNode } from "../base";

export const ForOfStatementBase = AwaitableNode(IterationStatement);
export class ForOfStatement extends ForOfStatementBase<ts.ForOfStatement> {
    /**
     * Gets this for of statement's initializer.
     */
    getInitializer(): VariableDeclarationList | Expression {
        return this.getNodeFromCompilerNode(this.compilerNode.initializer);
    }

    /**
     * Gets this for of statement's expression.
     */
    getExpression(): Expression {
        return this.getNodeFromCompilerNode(this.compilerNode.expression);
    }
}
