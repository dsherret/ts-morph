import { ts } from "@ts-morph/common";
import { AwaitableNode } from "../base";
import { Expression, ExpressionedNode } from "../expression";
import { VariableDeclarationList } from "../variable";
import { IterationStatement } from "./IterationStatement";

export const ForOfStatementBase = ExpressionedNode(AwaitableNode(IterationStatement));
export class ForOfStatement extends ForOfStatementBase<ts.ForOfStatement> {
    /**
     * Gets this for of statement's initializer.
     */
    getInitializer(): VariableDeclarationList | Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.initializer);
    }
}
