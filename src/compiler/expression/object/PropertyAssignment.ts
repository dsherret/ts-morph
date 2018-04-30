import { ts, SyntaxKind } from "../../../typescript";
import * as errors from "../../../errors";
import { CodeBlockWriter } from "../../../codeBlockWriter";
import { insertIntoParentTextRange } from "../../../manipulation";
import { getTextFromStringOrWriter } from "../../../utils";
import { PropertyNamedNode, QuestionTokenableNode, InitializerGetExpressionableNode } from "../../base";
import { Node } from "../../common";
import { ShorthandPropertyAssignment } from "./ShorthandPropertyAssignment";

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
        const colonToken = initializer.getPreviousSiblingIfKindOrThrow(SyntaxKind.ColonToken);
        const childIndex = this.getChildIndex();
        const sourceFileText = this.sourceFile.getFullText();
        const insertPos = this.getStart();
        const newText = sourceFileText.substring(insertPos, colonToken.getPos()) + sourceFileText.substring(initializer.getEnd(), this.getEnd());
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();

        insertIntoParentTextRange({
            insertPos,
            newText,
            parent,
            replacing: {
                textLength: this.getWidth()
            }
        });

        return parent.getChildAtIndexIfKindOrThrow(childIndex, SyntaxKind.ShorthandPropertyAssignment) as ShorthandPropertyAssignment;
    }

    /**
     * Sets the initializer.
     * @param text - New text to set for the initializer.
     */
    setInitializer(text: string): this;
    /**
     * Sets the initializer.
     * @param writerFunction - Writer function to set the initializer with.
     */
    setInitializer(writerFunction: (writer: CodeBlockWriter) => void): this;
    setInitializer(textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)): this {
        const initializer = this.getInitializerOrThrow();

        insertIntoParentTextRange({
            insertPos: initializer.getStart(),
            newText: getTextFromStringOrWriter(this.getWriterWithQueuedChildIndentation(), textOrWriterFunction),
            parent: this,
            replacing: {
                textLength: initializer.getWidth()
            }
        });

        return this;
    }
}
