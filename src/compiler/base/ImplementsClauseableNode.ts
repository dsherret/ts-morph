import * as ts from "typescript";
import {getNodeOrNodesToReturn, insertIntoCommaSeparatedNodes, verifyAndGetIndex} from "./../../manipulation";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import {HeritageClauseableNode} from "./HeritageClauseableNode";
import {ExpressionWithTypeArguments} from "./../type/ExpressionWithTypeArguments";
import {TypeParameteredNode} from "./TypeParameteredNode";

export type ImplementsClauseableNodeExtensionType = Node & HeritageClauseableNode;

export interface ImplementsClauseableNode {
    /**
     * Gets the implements clauses.
     */
    getImplements(): ExpressionWithTypeArguments[];
    /**
     * Adds an implements clause.
     * @param text - Text to add for the implements clause.
     * @param sourceFile - Optional source file to help improve performance.
     */
    addImplements(text: string, sourceFile?: SourceFile): ExpressionWithTypeArguments;
    /**
     * Adds multiple implements clauses.
     * @param text - Texts to add for the implements clause.
     * @param sourceFile - Optional source file to help improve performance.
     */
    addImplements(text: string[], sourceFile?: SourceFile): ExpressionWithTypeArguments[];
    /**
     * Inserts an implements clause.
     * @param text - Text to insert for the implements clause.
     * @param sourceFile - Optional source file to help improve performance.
     */
    insertImplements(index: number, texts: string[], sourceFile?: SourceFile): ExpressionWithTypeArguments[];
    /**
     * Inserts multiple implements clauses.
     * @param text - Texts to insert for the implements clause.
     * @param sourceFile - Optional source file to help improve performance.
     */
    insertImplements(index: number, text: string, sourceFile?: SourceFile): ExpressionWithTypeArguments;
}

export function ImplementsClauseableNode<T extends Constructor<ImplementsClauseableNodeExtensionType>>(Base: T): Constructor<ImplementsClauseableNode> & T {
    return class extends Base implements ImplementsClauseableNode {
        getImplements(): ExpressionWithTypeArguments[] {
            const implementsClause = this.getHeritageClauses().find(c => c.node.token === ts.SyntaxKind.ImplementsKeyword);
            return implementsClause == null ? [] : implementsClause.getTypes();
        }

        addImplements(text: string[], sourceFile?: SourceFile): ExpressionWithTypeArguments[];
        addImplements(text: string, sourceFile?: SourceFile): ExpressionWithTypeArguments;
        addImplements(text: string | string[], sourceFile: SourceFile = this.getRequiredSourceFile()): ExpressionWithTypeArguments | ExpressionWithTypeArguments[] {
            return this.insertImplements(this.getImplements().length, text as any, sourceFile);
        }

        insertImplements(index: number, text: string[], sourceFile?: SourceFile): ExpressionWithTypeArguments[];
        insertImplements(index: number, text: string, sourceFile?: SourceFile): ExpressionWithTypeArguments;
        insertImplements(index: number, text: string | string[], sourceFile: SourceFile = this.getRequiredSourceFile()): ExpressionWithTypeArguments | ExpressionWithTypeArguments[] {
            const length = text instanceof Array ? text.length : 0;
            if (text instanceof Array) {
                if (text.length === 0)
                    return [];
                text = text.join(", ");
            }

            errors.throwIfNotStringOrWhitespace(text, nameof(text));
            const implementsTypes = this.getImplements();
            index = verifyAndGetIndex(index, implementsTypes.length);

            if (implementsTypes.length > 0) {
                insertIntoCommaSeparatedNodes(sourceFile, implementsTypes, index, text);
                return getNodeOrNodesToReturn(this.getImplements(), index, length);
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
            return getNodeOrNodesToReturn(this.getImplements(), index, length);
        }
    };
}
