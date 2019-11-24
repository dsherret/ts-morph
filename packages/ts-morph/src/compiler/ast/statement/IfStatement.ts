import { ts, SyntaxKind } from "@ts-morph/common";
import { Node } from "../common";
import { Expression } from "../expression";
import { Statement } from "./Statement";
import { removeStatementedNodeChildren } from "../../../manipulation";

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

    /** @inheritdoc */
    remove() {
        // need to also remove the else keyword if it exists
        const nodes: Node[] = [];
        if (Node.isIfStatement(this.getParentOrThrow()))
            nodes.push(this.getPreviousSiblingIfKindOrThrow(SyntaxKind.ElseKeyword));
        nodes.push(this);

        removeStatementedNodeChildren(nodes);
    }
}
