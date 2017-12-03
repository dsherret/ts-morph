import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {getNodeOrNodesToReturn, insertIntoCommaSeparatedNodes, verifyAndGetIndex, insertIntoCreatableSyntaxList} from "./../../manipulation";
import {ImplementsClauseableNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {HeritageClause} from "./../general";
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
     */
    addImplements(text: string): ExpressionWithTypeArguments;
    /**
     * Adds multiple implements clauses.
     * @param text - Texts to add for the implements clause.
     */
    addImplements(text: string[]): ExpressionWithTypeArguments[];
    /**
     * Inserts an implements clause.
     * @param text - Text to insert for the implements clause.
     */
    insertImplements(index: number, texts: string[]): ExpressionWithTypeArguments[];
    /**
     * Inserts multiple implements clauses.
     * @param text - Texts to insert for the implements clause.
     */
    insertImplements(index: number, text: string): ExpressionWithTypeArguments;
    /**
     * Removes the implements at the specified index.
     * @param index - Index to remove.
     */
    removeImplements(index: number): this;
    /**
     * Removes the specified implements.
     * @param implementsNode - Node of the implements to remove.
     */
    removeImplements(implementsNode: ExpressionWithTypeArguments): this;
}

export function ImplementsClauseableNode<T extends Constructor<ImplementsClauseableNodeExtensionType>>(Base: T): Constructor<ImplementsClauseableNode> & T {
    return class extends Base implements ImplementsClauseableNode {
        getImplements(): ExpressionWithTypeArguments[] {
            const implementsClause = this.getHeritageClauseByKind(ts.SyntaxKind.ImplementsKeyword);
            return implementsClause == null ? [] : implementsClause.getTypes();
        }

        addImplements(text: string[]): ExpressionWithTypeArguments[];
        addImplements(text: string): ExpressionWithTypeArguments;
        addImplements(text: string | string[]): ExpressionWithTypeArguments | ExpressionWithTypeArguments[] {
            return this.insertImplements(this.getImplements().length, text as any);
        }

        insertImplements(index: number, text: string[]): ExpressionWithTypeArguments[];
        insertImplements(index: number, text: string): ExpressionWithTypeArguments;
        insertImplements(index: number, texts: string | string[]): ExpressionWithTypeArguments | ExpressionWithTypeArguments[] {
            const length = texts instanceof Array ? texts.length : 0;
            if (typeof texts === "string") {
                errors.throwIfNotStringOrWhitespace(texts, nameof(texts));
                texts = [texts];
            }
            else if (texts.length === 0) {
                return [];
            }

            const heritageClauses = this.getHeritageClauses();
            const implementsTypes = this.getImplements();
            index = verifyAndGetIndex(index, implementsTypes.length);

            if (implementsTypes.length > 0) {
                const implementsClause = this.getHeritageClauseByKindOrThrow(ts.SyntaxKind.ImplementsKeyword);
                insertIntoCommaSeparatedNodes({
                    parent: implementsClause.getFirstChildByKindOrThrow(ts.SyntaxKind.SyntaxList),
                    currentNodes: implementsTypes,
                    insertIndex: index,
                    newTexts: texts
                });
                return getNodeOrNodesToReturn(this.getImplements(), index, length);
            }

            const openBraceToken = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenBraceToken);
            const openBraceStart = openBraceToken.getStart();
            const isLastSpace = /\s/.test(this.getSourceFile().getFullText()[openBraceStart - 1]);
            let insertText = `implements ${texts.join(", ")} `;
            if (!isLastSpace)
                insertText = " " + insertText;

            // assumes there can only be another extends heritage clause
            insertIntoCreatableSyntaxList({
                parent: this,
                insertPos: openBraceStart,
                newText: insertText,
                syntaxList: heritageClauses.length === 0 ? undefined : heritageClauses[0].getParentSyntaxListOrThrow(),
                childIndex: 1,
                insertItemsCount: 1
            });

            return getNodeOrNodesToReturn(this.getImplements(), index, length);
        }

        removeImplements(index: number): this;
        removeImplements(implementsNode: ExpressionWithTypeArguments): this;
        removeImplements(implementsNodeOrIndex: ExpressionWithTypeArguments | number) {
            const implementsClause = this.getHeritageClauseByKind(ts.SyntaxKind.ImplementsKeyword);
            if (implementsClause == null)
                throw new errors.InvalidOperationError("Cannot remove an implements when none exist.");

            implementsClause.removeExpression(implementsNodeOrIndex);
            return this;
        }

        fill(structure: Partial<ImplementsClauseableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.implements != null && structure.implements.length > 0)
                this.addImplements(structure.implements);

            return this;
        }
    };
}
