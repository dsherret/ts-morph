import {ts} from "../../../typescript";
import {replaceNodeText} from "../../../manipulation";
import {PrimaryExpression} from "../../expression";
import {TemplateLiteral} from "../../aliases";
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

    /**
     * Sets the literal value.
     *
     * Note: This could possibly replace the node if you remove all the tagged templates.
     * @param value - Value to set.
     * @returns The new node if the kind changed; the current node otherwise.
     */
    setLiteralValue(value: string) {
        const childIndex = this.getChildIndex();
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        replaceNodeText({
            sourceFile: this.sourceFile,
            start: this.getStart() + 1,
            replacingLength: this.getWidth() - 2,
            newText: value
        });

        return parent.getChildAtIndex(childIndex) as TemplateLiteral;
    }
}
