import { errors, SyntaxKind } from "@ts-morph/common";
import { getNodesToReturn, insertIntoCommaSeparatedNodes, insertIntoParentTextRange, verifyAndGetIndex } from "../../../manipulation";
import { CommaSeparatedStructuresPrinter, StringStructurePrinter } from "../../../structurePrinters";
import { ExtendsClauseableNodeStructure } from "../../../structures";
import { Constructor, WriterFunction } from "../../../types";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { ExpressionWithTypeArguments } from "../type/ExpressionWithTypeArguments";
import { HeritageClauseableNode } from "./HeritageClauseableNode";
import { callBaseGetStructure } from "../callBaseGetStructure";

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
    addExtends(texts: ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[];
    /**
     * Adds an extends clause.
     * @param text - Text to add for the extends clause.
     */
    addExtends(text: string): ExpressionWithTypeArguments;
    /**
     * Inserts multiple extends clauses.
     * @param texts - Texts to insert for the extends clause.
     */
    insertExtends(index: number, texts: ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[];
    /**
     * Inserts an extends clause.
     * @param text - Text to insert for the extends clause.
     */
    insertExtends(index: number, text: string): ExpressionWithTypeArguments;
    /**
     * Removes the extends at the specified index.
     * @param index - Index to remove.
     */
    removeExtends(index: number): this;
    /**
     * Removes the specified extends.
     * @param extendsNode - Node of the extend to remove.
     */
    removeExtends(extendsNode: ExpressionWithTypeArguments): this;
}

export function ExtendsClauseableNode<T extends Constructor<ExtendsClauseableNodeExtensionType>>(Base: T): Constructor<ExtendsClauseableNode> & T {
    return class extends Base implements ExtendsClauseableNode {
        getExtends(): ExpressionWithTypeArguments[] {
            const extendsClause = this.getHeritageClauseByKind(SyntaxKind.ExtendsKeyword);
            return extendsClause?.getTypeNodes() ?? [];
        }

        addExtends(texts: ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[];
        addExtends(text: string): ExpressionWithTypeArguments;
        addExtends(text: string | ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[] | ExpressionWithTypeArguments {
            return this.insertExtends(this.getExtends().length, text as any);
        }

        insertExtends(index: number, texts: ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[];
        insertExtends(index: number, text: string): ExpressionWithTypeArguments;
        insertExtends(index: number, texts: string | ReadonlyArray<string | WriterFunction> | WriterFunction): ExpressionWithTypeArguments[]
            | ExpressionWithTypeArguments
        {
            const originalExtends = this.getExtends();
            const wasStringInput = typeof texts === "string";

            if (typeof texts === "string") {
                errors.throwIfWhitespaceOrNotString(texts, nameof(texts));
                texts = [texts];
            }
            else if (texts.length === 0) {
                return [];
            }

            const writer = this._getWriterWithQueuedChildIndentation();
            const structurePrinter = new CommaSeparatedStructuresPrinter(new StringStructurePrinter());

            structurePrinter.printText(writer, texts);

            index = verifyAndGetIndex(index, originalExtends.length);

            if (originalExtends.length > 0) {
                const extendsClause = this.getHeritageClauseByKindOrThrow(SyntaxKind.ExtendsKeyword);
                insertIntoCommaSeparatedNodes({
                    parent: extendsClause.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
                    currentNodes: originalExtends,
                    insertIndex: index,
                    newText: writer.toString(),
                    useTrailingCommas: false
                });
            }
            else {
                const openBraceToken = this.getFirstChildByKindOrThrow(SyntaxKind.OpenBraceToken);
                const openBraceStart = openBraceToken.getStart();
                const isLastSpace = /\s/.test(this.getSourceFile().getFullText()[openBraceStart - 1]);
                let insertText = `extends ${writer.toString()} `;
                if (!isLastSpace)
                    insertText = " " + insertText;

                insertIntoParentTextRange({
                    parent: this,
                    insertPos: openBraceStart,
                    newText: insertText
                });
            }

            const newExtends = this.getExtends();
            return wasStringInput ? newExtends[index] : getNodesToReturn(originalExtends, newExtends, index, false);
        }

        removeExtends(index: number): this;
        removeExtends(implementsNode: ExpressionWithTypeArguments): this;
        removeExtends(implementsNodeOrIndex: ExpressionWithTypeArguments | number) {
            const extendsClause = this.getHeritageClauseByKind(SyntaxKind.ExtendsKeyword);
            if (extendsClause == null)
                throw new errors.InvalidOperationError("Cannot remove an extends when none exist.");

            extendsClause.removeExpression(implementsNodeOrIndex);
            return this;
        }

        set(structure: Partial<ExtendsClauseableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.extends != null) {
                this.getExtends().forEach(e => this.removeExtends(e));
                this.addExtends(structure.extends);
            }

            return this;
        }

        getStructure() {
            return callBaseGetStructure<ExtendsClauseableNodeStructure>(Base.prototype, this, {
                extends: this.getExtends().map(e => e.getText())
            });
        }
    };
}
