import * as ts from "typescript";
import * as errors from "./../../errors";
import {removeStatementedNodeChild} from "./../../manipulation";
import {Node, Expression} from "./../common";

export class ExportAssignment extends Node<ts.ExportAssignment> {
    /**
     * Gets if this is an export equals assignemnt.
     *
     * If this is false, then it's `export default`.
     */
    isExportEquals() {
        return this.compilerNode.isExportEquals || false;
    }

    /**
     * Gets the export assignment expression.
     */
    getExpression(): Expression {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.expression, this.sourceFile) as Expression;
    }

    /**
     * Removes this export assignment.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
