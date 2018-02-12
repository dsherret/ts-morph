import {ts} from "./../../../typescript";
import {LeftHandSideExpression, MemberExpression} from "./../../expression";
import {TemplateExpression} from "./TemplateExpression";

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
        return this.getNodeFromCompilerNode<TemplateExpression>(this.compilerNode.template);
    }
}
