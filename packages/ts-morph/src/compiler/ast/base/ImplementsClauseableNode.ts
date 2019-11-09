import { errors, SyntaxKind } from "@ts-morph/common";
import { getNodesToReturn, insertIntoCommaSeparatedNodes, insertIntoParentTextRange, verifyAndGetIndex } from "../../../manipulation";
import { CommaSeparatedStructuresPrinter, StringStructurePrinter } from "../../../structurePrinters";
import { ImplementsClauseableNodeStructure } from "../../../structures";
import { Constructor, WriterFunction } from "../../../types";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { ExpressionWithTypeArguments } from "../type/ExpressionWithTypeArguments";
import { HeritageClauseableNode } from "./HeritageClauseableNode";
import { callBaseGetStructure } from "../callBaseGetStructure";

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
    addImplements(text: ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[];
    /**
     * Inserts an implements clause.
     * @param text - Text to insert for the implements clause.
     */
    insertImplements(index: number, texts: ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[];
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
            return implementsClause?.getTypeNodes() ?? [];
        }

        addImplements(text: ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[];
        addImplements(text: string): ExpressionWithTypeArguments;
        addImplements(text: string | ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments | ExpressionWithTypeArguments[] {
            return this.insertImplements(this.getImplements().length, text as any);
        }

        insertImplements(index: number, text: ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[];
        insertImplements(index: number, text: string): ExpressionWithTypeArguments;
        insertImplements(index: number, texts: string | ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments
            | ExpressionWithTypeArguments[]
        {
            const originalImplements = this.getImplements();
            const wasStringInput = typeof texts === "string";

            if (typeof texts === "string") {
                errors.throwIfWhitespaceOrNotString(texts, nameof(texts));
                texts = [texts];
            }
            else if (texts.length === 0) {
                return [];
            }

            const writer = this._getWriterWithQueuedChildIndentation();
            const structurePrinter = new CommaSeparatedStructuresPrinter<string>(new StringStructurePrinter());

            structurePrinter.printText(writer, texts);

            const heritageClauses = this.getHeritageClauses();
            index = verifyAndGetIndex(index, originalImplements.length);

            if (originalImplements.length > 0) {
                const implementsClause = this.getHeritageClauseByKindOrThrow(SyntaxKind.ImplementsKeyword);
                insertIntoCommaSeparatedNodes({
                    parent: implementsClause.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
                    currentNodes: originalImplements,
                    insertIndex: index,
                    newText: writer.toString(),
                    useTrailingCommas: false
                });
            }
            else {
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
            }

            const newImplements = this.getImplements();
            return wasStringInput ? newImplements[0] : getNodesToReturn(originalImplements, newImplements, index, false);
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

        set(structure: Partial<ImplementsClauseableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.implements != null) {
                this.getImplements().forEach(expr => this.removeImplements(expr));
                this.addImplements(structure.implements);
            }

            return this;
        }

        getStructure() {
            return callBaseGetStructure<ImplementsClauseableNodeStructure>(Base.prototype, this, {
                implements: this.getImplements().map(node => node.getText())
            });
        }
    };
}
