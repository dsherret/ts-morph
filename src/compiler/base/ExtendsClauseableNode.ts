import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import {HeritageClauseableNode} from "./HeritageClauseableNode";
import {ExpressionWithTypeArguments} from "./../type/ExpressionWithTypeArguments";

export type ExtendsClauseableNodeExtensionType = Node & HeritageClauseableNode;

export interface ExtendsClauseableNode {
    getExtends(): ExpressionWithTypeArguments[];
    addExtends(text: string, sourceFile?: SourceFile): this;
}

export function ExtendsClauseableNode<T extends Constructor<ExtendsClauseableNodeExtensionType>>(Base: T): Constructor<ExtendsClauseableNode> & T {
    return class extends Base implements ExtendsClauseableNode {
        /**
         * Gets the extends clauses
         */
        getExtends(): ExpressionWithTypeArguments[] {
            const extendsClause = getHeritageClause(this, ts.SyntaxKind.ExtendsKeyword);
            return extendsClause == null ? [] : extendsClause.getTypes();
        }

        /**
         * Adds an extends clause.
         * @param text - Text to add for the extends clause.
         * @param sourceFile - Optional source file to help improve performance.
         */
        addExtends(text: string, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            errors.throwIfNotStringOrWhitespace(text, nameof(text));

            const extendsClause = getHeritageClause(this, ts.SyntaxKind.ExtendsKeyword);
            if (extendsClause != null) {
                sourceFile.insertText(extendsClause.getEnd(), `, ${text}`);
                return this;
            }

            const openBraceToken = this.getFirstChildByKind(ts.SyntaxKind.OpenBraceToken);
            /* istanbul ignore if */
            if (openBraceToken == null)
                throw new errors.InvalidOperationError("Could not found open brace token.");

            const openBraceStart = openBraceToken.getStart();
            const isLastSpace = /\s/.test(sourceFile.getFullText()[openBraceStart - 1]);
            let insertText = `extends ${text} `;
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
