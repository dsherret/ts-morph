import * as ts from "typescript";
import {Node} from "./../common";
import {HeritageClauseableNode} from "./HeritageClauseableNode";
import {ExpressionWithTypeArguments} from "./../type/ExpressionWithTypeArguments";

export type ImplementsClauseableNodeExtensionType = Node & HeritageClauseableNode;

export interface ImplementsClauseableNode {
    getImplementsExpressions(): ExpressionWithTypeArguments[];
}

export function ImplementsClauseableNode<T extends Constructor<ImplementsClauseableNodeExtensionType>>(Base: T): Constructor<ImplementsClauseableNode> & T {
    return class extends Base implements ImplementsClauseableNode {
        /**
         * Gets the implements clauses.
         */
        getImplementsExpressions(): ExpressionWithTypeArguments[] {
            const heritageClauses = this.getHeritageClauses();
            const implementsClause = heritageClauses.find(c => c.node.token === ts.SyntaxKind.ImplementsKeyword);
            if (implementsClause == null)
                return [];

            return implementsClause.getTypes();
        }
    };
}
