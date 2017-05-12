import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import {HeritageClauseableNode} from "./HeritageClauseableNode";
import {ExpressionWithTypeArguments} from "./../type/ExpressionWithTypeArguments";
import {TypeParameteredNode} from "./TypeParameteredNode";

export type ImplementsClauseableNodeExtensionType = Node & HeritageClauseableNode;

export interface ImplementsClauseableNode {
    getImplements(): ExpressionWithTypeArguments[];
    addImplements(text: string, sourceFile?: SourceFile): this;
}

export function ImplementsClauseableNode<T extends Constructor<ImplementsClauseableNodeExtensionType>>(Base: T): Constructor<ImplementsClauseableNode> & T {
    return class extends Base implements ImplementsClauseableNode {
        /**
         * Gets the implements clauses.
         */
        getImplements(): ExpressionWithTypeArguments[] {
            const implementsClause = getHeritageClause(this, ts.SyntaxKind.ImplementsKeyword);
            return implementsClause == null ? [] : implementsClause.getTypes();
        }

        /**
         * Adds an implements clause.
         * @param text - Text to add for the implements clause.
         * @param sourceFile - Optional source file to help improve performance.
         */
        addImplements(text: string, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            errors.throwIfNotStringOrWhitespace(text, nameof(text));

            const implementsClause = getHeritageClause(this, ts.SyntaxKind.ImplementsKeyword);
            if (implementsClause != null) {
                sourceFile.insertText(implementsClause.getEnd(), `, ${text}`);
                return this;
            }

            const openBraceToken = this.getFirstChildByKind(ts.SyntaxKind.OpenBraceToken);
            /* istanbul ignore if */
            if (openBraceToken == null)
                throw new errors.InvalidOperationError("Could not found open brace token.");

            const openBraceStart = openBraceToken.getStart();
            const isLastSpace = /\s/.test(sourceFile.getFullText()[openBraceStart - 1]);
            let insertText = `implements ${text} `;
            if (!isLastSpace)
                insertText = " " + insertText;

            sourceFile.insertText(openBraceStart, insertText);

            return this;
        }
    };
}

function getHeritageClause(node: Node & HeritageClauseableNode, kind: ts.SyntaxKind) {
    const heritageClauses = node.getHeritageClauses();
    return heritageClauses.find(c => c.node.token === kind);
}
