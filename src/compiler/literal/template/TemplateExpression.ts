import {ts} from "./../../../typescript";
import {PrimaryExpression} from "./../../expression";
import {TemplateHead} from "./TemplateHead";
import {TemplateSpan} from "./TemplateSpan";

export const TemplateExpressionBase = PrimaryExpression;
export class TemplateExpression extends TemplateExpressionBase<ts.TemplateExpression> {
    /**
     * Gets the template head.
     */
    getHead() {
        return this.getNodeFromCompilerNode<TemplateHead>(this.compilerNode.head);
    }

    /**
     * Gets the template spans.
     */
    getTemplateSpans() {
        return this.compilerNode.templateSpans.map(s => this.getNodeFromCompilerNode<TemplateSpan>(s));
    }
}
