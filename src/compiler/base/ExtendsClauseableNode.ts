import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {getNodeOrNodesToReturn, insertIntoCommaSeparatedNodes, verifyAndGetIndex, insertCreatingSyntaxList} from "./../../manipulation";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {HeritageClauseableNode} from "./HeritageClauseableNode";
import {ExpressionWithTypeArguments} from "./../type/ExpressionWithTypeArguments";

export type ExtendsClauseableNodeExtensionType = Node & HeritageClauseableNode;

export interface ExtendsClauseableNode {
    /**
     * Gets the extends clauses.
     */
    getExtends(): ExpressionWithTypeArguments[];
    /**
     * Adds multiple extends clauses.
     * @param texts - Texts to add for the extends clause.
     */
    addExtends(texts: string[]): ExpressionWithTypeArguments[];
    /**
     * Adds an extends clause.
     * @param text - Text to add for the extends clause.
     */
    addExtends(text: string): ExpressionWithTypeArguments;
    /**
     * Inserts multiple extends clauses.
     * @param texts - Texts to insert for the extends clause.
     */
    insertExtends(index: number, texts: string[]): ExpressionWithTypeArguments[];
    /**
     * Inserts an extends clause.
     * @param text - Text to insert for the extends clause.
     */
    insertExtends(index: number, text: string): ExpressionWithTypeArguments;
}

export function ExtendsClauseableNode<T extends Constructor<ExtendsClauseableNodeExtensionType>>(Base: T): Constructor<ExtendsClauseableNode> & T {
    return class extends Base implements ExtendsClauseableNode {
        getExtends(): ExpressionWithTypeArguments[] {
            const extendsClause = this.getHeritageClauses().find(c => c.compilerNode.token === ts.SyntaxKind.ExtendsKeyword);
            return extendsClause == null ? [] : extendsClause.getTypes();
        }

        addExtends(texts: string[]): ExpressionWithTypeArguments[];
        addExtends(text: string): ExpressionWithTypeArguments;
        addExtends(text: string | string[]): ExpressionWithTypeArguments[] | ExpressionWithTypeArguments {
            return this.insertExtends(this.getExtends().length, text as any);
        }

        insertExtends(index: number, texts: string[]): ExpressionWithTypeArguments[];
        insertExtends(index: number, text: string): ExpressionWithTypeArguments;
        insertExtends(index: number, texts: string | string[]): ExpressionWithTypeArguments[] | ExpressionWithTypeArguments {
            const length = texts instanceof Array ? texts.length : 0;
            if (typeof texts === "string") {
                errors.throwIfNotStringOrWhitespace(texts, nameof(texts));
                texts = [texts];
            }
            else if (texts.length === 0) {
                return [];
            }

            const extendsTypes = this.getExtends();
            index = verifyAndGetIndex(index, extendsTypes.length);

            if (extendsTypes.length > 0) {
                insertIntoCommaSeparatedNodes({ currentNodes: extendsTypes, insertIndex: index, newTexts: texts });
                return getNodeOrNodesToReturn(this.getExtends(), index, length);
            }

            const openBraceToken = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenBraceToken);
            const openBraceStart = openBraceToken.getStart();
            const isLastSpace = /\s/.test(this.getSourceFile().getFullText()[openBraceStart - 1]);
            let insertText = `extends ${texts.join(", ")} `;
            if (!isLastSpace)
                insertText = " " + insertText;

            insertCreatingSyntaxList({
                parent: this,
                insertPos: openBraceStart,
                newText: insertText
            });
            return getNodeOrNodesToReturn(this.getExtends(), index, length);
        }
    };
}
