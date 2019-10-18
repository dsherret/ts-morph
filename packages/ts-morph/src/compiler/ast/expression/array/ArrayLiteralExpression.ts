import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { getNodesToReturn, insertIntoCommaSeparatedNodes, removeCommaSeparatedChild, verifyAndGetIndex } from "../../../../manipulation";
import { CommaNewLineSeparatedStructuresPrinter, CommaSeparatedStructuresPrinter, StringStructurePrinter } from "../../../../structurePrinters";
import { WriterFunction } from "../../../../types";
import { Expression } from "../Expression";
import { PrimaryExpression } from "../PrimaryExpression";

export class ArrayLiteralExpression extends PrimaryExpression<ts.ArrayLiteralExpression> {
    /**
     * Gets the array's elements.
     */
    getElements(): Expression[] {
        return this.compilerNode.elements.map(e => this._getNodeFromCompilerNode(e));
    }

    /**
     * Adds an element to the array.
     * @param textOrWriterFunction - Text to add as an element.
     * @param options - Options.
     */
    addElement(textOrWriterFunction: string | WriterFunction, options?: { useNewLines?: boolean; }) {
        return this.addElements([textOrWriterFunction], options)[0];
    }

    /**
     * Adds elements to the array.
     * @param textsOrWriterFunction - Texts to add as elements.
     * @param options - Options.
     */
    addElements(textsOrWriterFunction: ReadonlyArray<string | WriterFunction> | WriterFunction, options?: { useNewLines?: boolean; }) {
        return this.insertElements(this.compilerNode.elements.length, textsOrWriterFunction, options);
    }

    /**
     * Insert an element into the array.
     * @param index - Child index to insert at.
     * @param text - Text to insert as an element.
     * @param options - Options.
     */
    insertElement(index: number, textOrWriterFunction: string | WriterFunction, options?: { useNewLines?: boolean; }) {
        return this.insertElements(index, [textOrWriterFunction], options)[0];
    }

    /**
     * Insert elements into the array.
     * @param index - Child index to insert at.
     * @param textsOrWriterFunction - Texts to insert as elements.
     * @param options - Options.
     */
    insertElements(index: number, textsOrWriterFunction: ReadonlyArray<string | WriterFunction> | WriterFunction, options: { useNewLines?: boolean; } = {}) {
        const elements = this.getElements();
        index = verifyAndGetIndex(index, elements.length);
        const useNewLines = getUseNewLines(this);

        const writer = useNewLines ? this._getWriterWithChildIndentation() : this._getWriterWithQueuedChildIndentation();
        const stringStructurePrinter = new StringStructurePrinter();
        const structurePrinter = useNewLines
            ? new CommaNewLineSeparatedStructuresPrinter(stringStructurePrinter)
            : new CommaSeparatedStructuresPrinter(stringStructurePrinter);

        structurePrinter.printText(writer, textsOrWriterFunction);

        return insertTexts(this);

        function insertTexts(node: ArrayLiteralExpression) {
            insertIntoCommaSeparatedNodes({
                parent: node.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
                currentNodes: elements,
                insertIndex: index,
                newText: writer.toString(),
                useNewLines,
                useTrailingCommas: useNewLines && node._context.manipulationSettings.getUseTrailingCommas()
            });

            const newElements = node.getElements();
            return getNodesToReturn(elements, newElements, index, false);
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
