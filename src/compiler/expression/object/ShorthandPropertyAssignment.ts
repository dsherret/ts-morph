import * as errors from "../../../errors";
import { insertIntoParentTextRange, removeChildren, removeCommaSeparatedChild } from "../../../manipulation";
import { SyntaxKind, ts } from "../../../typescript";
import { InitializerGetExpressionableNode, NamedNode, QuestionTokenableNode } from "../../base";
import { Node } from "../../common/Node";
import { Expression } from "../Expression";
import { PropertyAssignment } from "./PropertyAssignment";

// This node only has an object assignment initializer, equals token, and question token, in order to tell the user about bad code
// (See https://github.com/Microsoft/TypeScript/pull/5121/files)

export const ShorthandPropertyAssignmentBase = InitializerGetExpressionableNode(QuestionTokenableNode(NamedNode(Node)));
export class ShorthandPropertyAssignment extends ShorthandPropertyAssignmentBase<ts.ShorthandPropertyAssignment> {
    /**
     * Gets if the shorthand property assignment has an object assignment initializer.
     */
    hasObjectAssignmentInitializer() {
        return this.compilerNode.objectAssignmentInitializer != null;
    }

    /**
     * Gets the object assignment initializer or throws if it doesn't exist.
     */
    getObjectAssignmentInitializerOrThrow() {
        return errors.throwIfNullOrUndefined(this.getObjectAssignmentInitializer(), "Expected to find an object assignment initializer.");
    }

    /**
     * Gets the object assignment initializer if it exists.
     */
    getObjectAssignmentInitializer(): Expression | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.objectAssignmentInitializer);
    }

    /**
     * Gets the equals token or throws if it doesn't exist.
     */
    getEqualsTokenOrThrow() {
        return errors.throwIfNullOrUndefined(this.getEqualsToken(), "Expected to find an equals token.");
    }

    /**
     * Gets the equals token if it exists.
     */
    getEqualsToken() {
        const equalsToken = this.compilerNode.equalsToken;
        if (equalsToken == null)
            return undefined;
        return this.getNodeFromCompilerNode(equalsToken);
    }

    /**
     * Remove the object assignment initializer.
     *
     * This is only useful to remove bad code.
     */
    removeObjectAssignmentInitializer() {
        if (!this.hasObjectAssignmentInitializer())
            return this;

        removeChildren({
            children: [this.getEqualsTokenOrThrow(), this.getObjectAssignmentInitializerOrThrow()],
            removePrecedingSpaces: true
        });

        return this;
    }

    /**
     * Sets the initializer.
     *
     * Note: The current node will no longer be valid because it's no longer a shorthand property assignment.
     * @param text - New text to set for the initializer.
     */
    setInitializer(text: string): PropertyAssignment {
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        const childIndex = this.getChildIndex();

        insertIntoParentTextRange({
            insertPos: this.getStart(),
            newText: this.getText() + `: ${text}`,
            parent,
            replacing: {
                textLength: this.getWidth()
            }
        });

        return parent.getChildAtIndexIfKindOrThrow(childIndex, SyntaxKind.PropertyAssignment) as PropertyAssignment;
    }

    /**
     * Removes this property.
     */
    remove() {
        removeCommaSeparatedChild(this);
    }
}
