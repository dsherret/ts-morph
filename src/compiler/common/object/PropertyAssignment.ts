import * as ts from "typescript";
import * as errors from "./../../../errors";
import {insertIntoParent} from "./../../../manipulation";
import {PropertyNamedNode, QuestionTokenableNode, InitializerGetExpressionableNode} from "./../../base";
import {Node} from "./../Node";
import {ShorthandPropertyAssignment} from "./ShorthandPropertyAssignment";

// This node only has a question token in order to tell the user about bad code.
// (See https://github.com/Microsoft/TypeScript/pull/5121/files)

export const PropertyAssignmentBase = InitializerGetExpressionableNode(QuestionTokenableNode(PropertyNamedNode(Node)));
export class PropertyAssignment extends PropertyAssignmentBase<ts.PropertyAssignment> {
    /**
     * Removes the initailizer and returns the new shorthand property assignment.
     *
     * Note: The current node will no longer be valid because it's no longer a property assignment.
     */
    removeInitializer(): ShorthandPropertyAssignment {
        const initializer = this.getInitializerOrThrow();
        const colonToken = initializer.getPreviousSiblingIfKindOrThrow(ts.SyntaxKind.ColonToken);
        const childIndex = this.getChildIndex();
        const sourceFileText = this.sourceFile.getFullText();
        const insertPos = this.getStart();
        const newText = sourceFileText.substring(insertPos, colonToken.getPos()) + sourceFileText.substring(initializer.getEnd(), this.getEnd());
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();

        insertIntoParent({
            childIndex,
            insertPos,
            newText,
            parent,
            insertItemsCount: 1,
            replacing: {
                nodes: [this],
                textLength: this.getWidth()
            }
        });

        return parent.getChildAtIndexIfKindOrThrow(childIndex, ts.SyntaxKind.ShorthandPropertyAssignment) as ShorthandPropertyAssignment;
    }

    /**
     * Sets the initializer.
     * @param text - New text to set for the initializer.
     */
    setInitializer(text: string): this {
        const initializer = this.getInitializerOrThrow();

        insertIntoParent({
            childIndex: initializer.getChildIndex(),
            insertPos: initializer.getStart(),
            newText: text,
            parent: this,
            insertItemsCount: 1,
            replacing: {
                nodes: [initializer],
                textLength: initializer.getWidth()
            }
        });

        return this;
    }
}
