import * as ts from "typescript";
import {callBaseFill} from "./../callBaseFill";
import {Expression} from "./../common";
import {ForOfStatementStructure} from "./../../structures";
import {IterationStatement} from "./IterationStatement";
import {VariableDeclarationList} from "./VariableDeclarationList";
import {AwaitableNode} from "../base";

export const ForOfStatementBase = AwaitableNode(IterationStatement);
export class ForOfStatement extends ForOfStatementBase<ts.ForOfStatement> {
    /**
     * Gets this for of statement's initializer.
     */
    getInitializer() {
        return this.getNodeFromCompilerNode(this.compilerNode.initializer) as (VariableDeclarationList | Expression);
    }

    /**
     * Gets this for of statement's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode(this.compilerNode.expression) as Expression;
    }

    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<ForOfStatementStructure>) {
        callBaseFill(ForOfStatementBase.prototype, this, structure);
        return this;
    }
}
