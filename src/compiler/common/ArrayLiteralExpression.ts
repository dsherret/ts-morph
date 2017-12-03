import * as ts from "typescript";
import * as errors from "./../../errors";
import {insertIntoCommaSeparatedNodes, verifyAndGetIndex, removeCommaSeparatedChild} from "./../../manipulation";
import {Expression} from "./Expression";

export class ArrayLiteralExpression extends Expression<ts.ArrayLiteralExpression> {
    /**
     * Gets the array's elements.
     */
    getElements(): Expression[] {
        return this.compilerNode.elements.map(e => this.global.compilerFactory.getNodeFromCompilerNode(e, this.sourceFile)) as Expression[];
    }

    /**
     * Adds an element to the array.
     * @param text - Text to add as an element.
     */
    addElement(text: string) {
        return this.addElements([text])[0];
    }

    /**
     * Adds elements to the array.
     * @param texts - Texts to add as elements.
     */
    addElements(texts: string[]) {
        return this.insertElements(this.compilerNode.elements.length, texts);
    }

    /**
     * Insert an element into the array.
     * @param index - Index to insert at.
     * @param text - Text to insert as an element.
     */
    insertElement(index: number, text: string) {
        return this.insertElements(index, [text])[0];
    }

    /**
     * Insert elements into the array.
     * @param index - Index to insert at.
     * @param texts - Texts to insert as elements.
     */
    insertElements(index: number, texts: string[]) {
        const elements = this.getElements();
        index = verifyAndGetIndex(index, elements.length);

        insertIntoCommaSeparatedNodes({
            parent: this.getFirstChildByKindOrThrow(ts.SyntaxKind.SyntaxList),
            currentNodes: elements,
            insertIndex: index,
            newTexts: texts
        });

        return this.getElements().slice(index, index + texts.length);
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
