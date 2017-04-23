import * as ts from "typescript";
import {Node} from "./../common";
import {HeritageClauseableNode} from "./HeritageClauseableNode";
import {ExpressionWithTypeArguments} from "./../type/ExpressionWithTypeArguments";

export type ExtendsClauseableNodeExtensionType = Node<ts.Node> & HeritageClauseableNode;

export interface ExtendsClauseableNode {
    getExtendsExpressions(): ExpressionWithTypeArguments[];
}

export function ExtendsClauseableNode<T extends Constructor<ExtendsClauseableNodeExtensionType>>(Base: T): Constructor<ExtendsClauseableNode> & T {
    return class extends Base implements ExtendsClauseableNode {
        /**
         * Gets the extends clauses
         */
        getExtendsExpressions(): ExpressionWithTypeArguments[] {
            const heritageClauses = this.getHeritageClauses();
            const extendsClause = heritageClauses.find(c => c.node.token === ts.SyntaxKind.ExtendsKeyword);
            if (extendsClause == null)
                return [];

            return extendsClause.getTypes();
        }
    };
}
