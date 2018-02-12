import {ts, SyntaxKind} from "./../../../typescript";
import CodeBlockWriter from "code-block-writer";
import * as errors from "./../../../errors";
import {insertIntoCommaSeparatedNodes, verifyAndGetIndex, removeCommaSeparatedChild} from "./../../../manipulation";
import {Expression} from "./../Expression";
import {PrimaryExpression} from "./../PrimaryExpression";

export class ArrayLiteralExpression extends PrimaryExpression<ts.ArrayLiteralExpression> {
    /**
     * Gets the array's elements.
     */
    getElements(): Expression[] {
        return this.compilerNode.elements.map(e => this.getNodeFromCompilerNode<Expression>(e));
    }

    /**
     * Adds an element to the array.
     * @param text - Text to add as an element.
     * @param options - Options.
     */
    addElement(text: string, options?: { useNewLines?: boolean; }) {
        return this.addElements([text], options)[0];
    }

    /**
     * Adds elements to the array.
     * @param texts - Texts to add as elements.
     * @param options - Options.
     */
    addElements(texts: string[], options?: { useNewLines?: boolean; }) {
        return this.insertElements(this.compilerNode.elements.length, texts, options);
    }

    /**
     * Insert an element into the array.
     * @param index - Index to insert at.
     * @param text - Text to insert as an element.
     * @param options - Options.
     */
    insertElement(index: number, text: string, options?: { useNewLines?: boolean; }) {
        return this.insertElements(index, [text], options)[0];
    }

    /**
     * Insert elements into the array.
     * @param index - Index to insert at.
     * @param texts - Texts to insert as elements.
     * @param options - Options.
     */
    insertElements(index: number, texts: string[], options?: { useNewLines?: boolean; }): Expression[];
    /**
     * Insert elements into the array.
     * @param index - Index to insert at.
     * @param writerFunction - Write the text using the provided writer.
     * @param options - Options.
     */
    insertElements(index: number, writerFunction: (writer: CodeBlockWriter) => void, options?: { useNewLines?: boolean; }): Expression[];
    insertElements(index: number, textsOrWriterFunction: string[] | ((writer: CodeBlockWriter) => void), options: { useNewLines?: boolean; } = {}) {
        const elements = this.getElements();
        index = verifyAndGetIndex(index, elements.length);
        const useNewLines = getUseNewLines(this);

        if (textsOrWriterFunction instanceof Function) {
            const writer = this.getWriterWithChildIndentation();
            textsOrWriterFunction(writer);
            return insertTexts(this, [writer.toString()]);
        }
        else {
            const childIndentationText = useNewLines ? this.getChildIndentationText() : "";
            return insertTexts(this, textsOrWriterFunction.map(t => childIndentationText + t));
        }

        function insertTexts(node: ArrayLiteralExpression, newTexts: string[]) {
            insertIntoCommaSeparatedNodes({
                parent: node.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
                currentNodes: elements,
                insertIndex: index,
                newTexts,
                useNewLines
            });

            const newElements = node.getElements();
            return newElements.slice(index, index + (newElements.length - elements.length));
        }

        function getUseNewLines(node: ArrayLiteralExpression) {
            if (options.useNewLines != null)
                return options.useNewLines;
            if (elements.length > 1)
                return allElementsOnDifferentLines();
            return node.getStartLineNumber() !== node.getEndLineNumber();

            function allElementsOnDifferentLines() {
                let previousLine = elements[0].getStartLineNumber();
                for (let i = 1; i < elements.length; i++) {
                    const currentLine = elements[i].getStartLineNumber();
                    if (previousLine === currentLine)
                        return false;
                    previousLine = currentLine;
                }
                return true;
            }
        }
    }

    /**
     * Removes an element from the array.
     * @param index - Index to remove from.
     */
    removeElement(index: number): void;
    /**
     * Removes an element from the array.
     * @param element - Element to remove.
     */
    removeElement(element: Expression): void;
    removeElement(elementOrIndex: Expression | number) {
        const elements = this.getElements();
        if (elements.length === 0)
            throw new errors.InvalidOperationError("Cannot remove an element when none exist.");

        const elementToRemove = typeof elementOrIndex === "number" ? getElementFromIndex(elementOrIndex) : elementOrIndex;
        removeCommaSeparatedChild(elementToRemove);

        function getElementFromIndex(index: number) {
            return elements[verifyAndGetIndex(index, elements.length - 1)];
        }
    }
}
