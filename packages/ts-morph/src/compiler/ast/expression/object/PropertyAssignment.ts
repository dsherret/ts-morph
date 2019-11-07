import { SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange } from "../../../../manipulation";
import { WriterFunction } from "../../../../types";
import { getTextFromStringOrWriter } from "../../../../utils";
import { InitializerExpressionGetableNode, PropertyNamedNode, QuestionTokenableNode } from "../../base";
import { ShorthandPropertyAssignment } from "./ShorthandPropertyAssignment";
import { PropertyAssignmentStructure, PropertyAssignmentSpecificStructure, StructureKind } from "../../../../structures";
import { callBaseSet } from "../../callBaseSet";
import { callBaseGetStructure } from "../../callBaseGetStructure";
import { ObjectLiteralElement } from "./ObjectLiteralElement";

// This node only has a question token in order to tell the user about bad code.
// (See https://github.com/Microsoft/TypeScript/pull/5121/files)

const createBase = <T extends typeof ObjectLiteralElement>(ctor: T) => InitializerExpressionGetableNode(
    QuestionTokenableNode(PropertyNamedNode(ctor))
);
export const PropertyAssignmentBase = createBase(ObjectLiteralElement);
export class PropertyAssignment extends PropertyAssignmentBase<ts.PropertyAssignment> {
    /**
     * Removes the initializer and returns the new shorthand property assignment.
     *
     * Note: The current node will no longer be valid because it's no longer a property assignment.
     */
    removeInitializer(): ShorthandPropertyAssignment {
        const initializer = this.getInitializerOrThrow();
        const colonToken = initializer.getPreviousSiblingIfKindOrThrow(SyntaxKind.ColonToken);
        const childIndex = this.getChildIndex();
        const sourceFileText = this._sourceFile.getFullText();
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
     * @param textOrWriterFunction - New text ot set for the initializer.
     */
    setInitializer(textOrWriterFunction: string | WriterFunction): this {
        const initializer = this.getInitializerOrThrow();

        insertIntoParentTextRange({
            insertPos: initializer.getStart(),
            newText: getTextFromStringOrWriter(this._getWriterWithQueuedChildIndentation(), textOrWriterFunction),
            parent: this,
            replacing: {
                textLength: initializer.getWidth()
            }
        });
        return this;
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<PropertyAssignmentStructure>) {
        callBaseSet(PropertyAssignmentBase.prototype, this, structure);

        if (structure.initializer != null)
            this.setInitializer(structure.initializer);
        else if (structure.hasOwnProperty(nameof(structure.initializer)))
            return this.removeInitializer();

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure() {
        const initializer = this.getInitializerOrThrow();
        const structure = callBaseGetStructure<PropertyAssignmentSpecificStructure>(PropertyAssignmentBase.prototype, this, {
            kind: StructureKind.PropertyAssignment,
            initializer: initializer.getText()
        }) as any as PropertyAssignmentStructure;

        // only has a question token for bad code. Don't include it in the structure.
        delete (structure as any).hasQuestionToken;

        return structure;
    }
}
