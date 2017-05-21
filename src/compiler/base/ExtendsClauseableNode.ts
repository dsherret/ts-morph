import * as ts from "typescript";
import {getNodeOrNodesToReturn, insertIntoCommaSeparatedNodes, verifyAndGetIndex} from "./../../manipulation";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {SourceFile} from "./../file";
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
     * @param sourceFile - Optional source file to help improve performance.
     */
    addExtends(texts: string[], sourceFile?: SourceFile): ExpressionWithTypeArguments[];
    /**
     * Adds an extends clause.
     * @param text - Text to add for the extends clause.
     * @param sourceFile - Optional source file to help improve performance.
     */
    addExtends(text: string, sourceFile?: SourceFile): ExpressionWithTypeArguments;
    /**
     * Inserts multiple extends clauses.
     * @param texts - Texts to insert for the extends clause.
     * @param sourceFile - Optional source file to help improve performance.
     */
    insertExtends(index: number, texts: string[], sourceFile?: SourceFile): ExpressionWithTypeArguments[];
    /**
     * Inserts an extends clause.
     * @param text - Text to insert for the extends clause.
     * @param sourceFile - Optional source file to help improve performance.
     */
    insertExtends(index: number, text: string, sourceFile?: SourceFile): ExpressionWithTypeArguments;
}

export function ExtendsClauseableNode<T extends Constructor<ExtendsClauseableNodeExtensionType>>(Base: T): Constructor<ExtendsClauseableNode> & T {
    return class extends Base implements ExtendsClauseableNode {
        getExtends(): ExpressionWithTypeArguments[] {
            const extendsClause = this.getHeritageClauses().find(c => c.node.token === ts.SyntaxKind.ExtendsKeyword);
            return extendsClause == null ? [] : extendsClause.getTypes();
        }

        addExtends(texts: string[], sourceFile?: SourceFile): ExpressionWithTypeArguments[];
        addExtends(text: string, sourceFile?: SourceFile): ExpressionWithTypeArguments;
        addExtends(text: string | string[], sourceFile: SourceFile = this.getRequiredSourceFile()): ExpressionWithTypeArguments[] | ExpressionWithTypeArguments {
            return this.insertExtends(this.getExtends().length, text as any, sourceFile);
        }

        insertExtends(index: number, texts: string[], sourceFile?: SourceFile): ExpressionWithTypeArguments[];
        insertExtends(index: number, text: string, sourceFile?: SourceFile): ExpressionWithTypeArguments;
        insertExtends(index: number, texts: string | string[], sourceFile: SourceFile = this.getRequiredSourceFile()): ExpressionWithTypeArguments[] | ExpressionWithTypeArguments {
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
                insertIntoCommaSeparatedNodes(sourceFile, extendsTypes, index, texts);
                return getNodeOrNodesToReturn(this.getExtends(), index, length);
            }

            const openBraceToken = this.getFirstChildByKind(ts.SyntaxKind.OpenBraceToken);
            /* istanbul ignore if */
            if (openBraceToken == null)
                throw new errors.InvalidOperationError("Could not found open brace token.");

            const openBraceStart = openBraceToken.getStart();
            const isLastSpace = /\s/.test(sourceFile.getFullText()[openBraceStart - 1]);
            let insertText = `extends ${texts.join(", ")} `;
            if (!isLastSpace)
                insertText = " " + insertText;

            sourceFile.insertText(openBraceStart, insertText);
            return getNodeOrNodesToReturn(this.getExtends(), index, length);
        }
    };
}
