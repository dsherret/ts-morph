import * as errors from "../../errors";
import { getNodeOrNodesToReturn, insertIntoCommaSeparatedNodes, insertIntoParentTextRange, verifyAndGetIndex } from "../../manipulation";
import { CommaSeparatedStructuresPrinter, StringStructurePrinter } from "../../structurePrinters";
import { ImplementsClauseableNodeStructure } from "../../structures";
import { Constructor } from "../../types";
import { SyntaxKind } from "../../typescript";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { ExpressionWithTypeArguments } from "../type/ExpressionWithTypeArguments";
import { HeritageClauseableNode } from "./HeritageClauseableNode";

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
            const implementsClause = this.getHeritageClauseByKind(SyntaxKind.ImplementsKeyword);
            return implementsClause == null ? [] : implementsClause.getTypeNodes();
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

            const writer = this.getWriterWithQueuedChildIndentation();
            const structurePrinter = new CommaSeparatedStructuresPrinter(new StringStructurePrinter());

            structurePrinter.printText(writer, texts);

            const heritageClauses = this.getHeritageClauses();
            const implementsTypes = this.getImplements();
            index = verifyAndGetIndex(index, implementsTypes.length);

            if (implementsTypes.length > 0) {
                const implementsClause = this.getHeritageClauseByKindOrThrow(SyntaxKind.ImplementsKeyword);
                insertIntoCommaSeparatedNodes({
                    parent: implementsClause.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
                    currentNodes: implementsTypes,
                    insertIndex: index,
                    newText: writer.toString()
                });
                return getNodeOrNodesToReturn(this.getImplements(), index, length);
            }

            const openBraceToken = this.getFirstChildByKindOrThrow(SyntaxKind.OpenBraceToken);
            const openBraceStart = openBraceToken.getStart();
            const isLastSpace = /\s/.test(this.getSourceFile().getFullText()[openBraceStart - 1]);
            let insertText = `implements ${writer.toString()} `;
            if (!isLastSpace)
                insertText = " " + insertText;

            // assumes there can only be another extends heritage clause
            insertIntoParentTextRange({
                parent: heritageClauses.length === 0 ? this : heritageClauses[0].getParentSyntaxListOrThrow(),
                insertPos: openBraceStart,
                newText: insertText
            });

            return getNodeOrNodesToReturn(this.getImplements(), index, length);
        }

        removeImplements(index: number): this;
        removeImplements(implementsNode: ExpressionWithTypeArguments): this;
        removeImplements(implementsNodeOrIndex: ExpressionWithTypeArguments | number) {
            const implementsClause = this.getHeritageClauseByKind(SyntaxKind.ImplementsKeyword);
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
