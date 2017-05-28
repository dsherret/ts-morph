import * as ts from "typescript";
import {getNodeOrNodesToReturn, insertIntoCommaSeparatedNodes, verifyAndGetIndex, insertCreatingSyntaxList, insertIntoSyntaxList} from "./../../manipulation";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {HeritageClause} from "./../general";
import {SourceFile} from "./../file";
import {HeritageClauseableNode} from "./HeritageClauseableNode";
import {ExpressionWithTypeArguments} from "./../type/ExpressionWithTypeArguments";

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
        getImplements(heritageClauses: HeritageClause[] = this.getHeritageClauses()): ExpressionWithTypeArguments[] {
            const implementsClause = heritageClauses.find(c => c.node.token === ts.SyntaxKind.ImplementsKeyword);
            return implementsClause == null ? [] : implementsClause.getTypes();
        }

        addImplements(text: string[], sourceFile?: SourceFile): ExpressionWithTypeArguments[];
        addImplements(text: string, sourceFile?: SourceFile): ExpressionWithTypeArguments;
        addImplements(text: string | string[], sourceFile: SourceFile = this.getSourceFileOrThrow()): ExpressionWithTypeArguments | ExpressionWithTypeArguments[] {
            return this.insertImplements(this.getImplements().length, text as any, sourceFile);
        }

        insertImplements(index: number, text: string[], sourceFile?: SourceFile): ExpressionWithTypeArguments[];
        insertImplements(index: number, text: string, sourceFile?: SourceFile): ExpressionWithTypeArguments;
        insertImplements(index: number, texts: string | string[], sourceFile: SourceFile = this.getSourceFileOrThrow()): ExpressionWithTypeArguments | ExpressionWithTypeArguments[] {
            const length = texts instanceof Array ? texts.length : 0;
            if (typeof texts === "string") {
                errors.throwIfNotStringOrWhitespace(texts, nameof(texts));
                texts = [texts];
            }
            else if (texts.length === 0) {
                return [];
            }

            const heritageClauses = this.getHeritageClauses();
            const implementsTypes = this.getImplements(heritageClauses);
            index = verifyAndGetIndex(index, implementsTypes.length);

            if (implementsTypes.length > 0) {
                insertIntoCommaSeparatedNodes(sourceFile, implementsTypes, index, texts);
                return getNodeOrNodesToReturn(this.getImplements(), index, length);
            }

            const openBraceToken = this.getFirstChildByKind(ts.SyntaxKind.OpenBraceToken, sourceFile);
            /* istanbul ignore if */
            if (openBraceToken == null)
                throw new errors.InvalidOperationError("Could not found open brace token.");

            const openBraceStart = openBraceToken.getStart();
            const isLastSpace = /\s/.test(sourceFile.getFullText()[openBraceStart - 1]);
            let insertText = `implements ${texts.join(", ")} `;
            if (!isLastSpace)
                insertText = " " + insertText;

            // assumes there can only be another extends heritage clause
            if (heritageClauses.length === 0)
                insertCreatingSyntaxList(sourceFile, openBraceStart, insertText);
            else
                insertIntoSyntaxList(sourceFile, openBraceStart, insertText, heritageClauses[0].getParentSyntaxListOrThrow(), 1, 1);

            return getNodeOrNodesToReturn(this.getImplements(), index, length);
        }
    };
}
