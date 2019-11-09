import { ts } from "@ts-morph/common";
import { insertIntoParentTextRange } from "../../../../manipulation";
import { TemplateLiteral } from "../../aliases";
import { LeftHandSideExpression, MemberExpression } from "../../expression";

export class TaggedTemplateExpression extends MemberExpression<ts.TaggedTemplateExpression> {
    /**
     * Gets the tag.
     */
    getTag(): LeftHandSideExpression {
        return this._getNodeFromCompilerNode(this.compilerNode.tag);
    }

    /**
     * Gets the template literal.
     */
    getTemplate(): TemplateLiteral {
        return this._getNodeFromCompilerNode(this.compilerNode.template);
    }

    /**
     * Removes the tag from the tagged template.
     * @returns The new template expression.
     */
    removeTag(): TemplateLiteral {
        const parent = this.getParentSyntaxList() ?? this.getParentOrThrow();
        const index = this.getChildIndex();
        const template = this.getTemplate();
        insertIntoParentTextRange({
            // @code-fence-allow(getChildren): This seems a little suspect, but shouldn't cause any issues...
            customMappings: (newParent, newSourceFile) => [{ currentNode: template, newNode: newParent.getChildren(newSourceFile)[index] }],
            parent,
            insertPos: this.getStart(),
            newText: this.getTemplate().getText(),
            replacing: {
                textLength: this.getWidth(),
                nodes: [this]
            }
        });

        return parent.getChildAtIndex(index) as TemplateLiteral;
    }
}
