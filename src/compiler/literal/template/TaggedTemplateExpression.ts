import {ts, SyntaxKind} from "../../../typescript";
import {insertIntoParentTextRange} from "../../../manipulation";
import {LeftHandSideExpression, MemberExpression} from "../../expression";
import {TemplateLiteral} from "../../aliases";
import {TemplateExpression} from "./TemplateExpression";
import {NoSubstitutionTemplateLiteral} from "./NoSubstitutionTemplateLiteral";

export const TaggedTemplateExpressionBase = MemberExpression;
export class TaggedTemplateExpression extends TaggedTemplateExpressionBase<ts.TaggedTemplateExpression> {
    /**
     * Gets the tag.
     */
    getTag() {
        return this.getNodeFromCompilerNode<LeftHandSideExpression>(this.compilerNode.tag);
    }

    /**
     * Gets the template literal.
     */
    getTemplate() {
        return this.getNodeFromCompilerNode<TemplateLiteral>(this.compilerNode.template);
    }

    /**
     * Removes the tag from the tagged template.
     * @returns The new template expression.
     */
    removeTag(): TemplateLiteral {
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        const index = this.getChildIndex();
        const template = this.getTemplate();
        insertIntoParentTextRange({
            customMappings: newParent => [{ currentNode: template, newNode: newParent.getChildAtIndex(index) }],
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
