import { ts } from "@ts-morph/common";
import { replaceNodeText } from "../../../../manipulation";
import { TemplateLiteral } from "../../aliases";
import { PrimaryExpression } from "../../expression";
import { TemplateHead } from "./TemplateHead";

export const TemplateExpressionBase = PrimaryExpression;
export class TemplateExpression extends TemplateExpressionBase<ts.TemplateExpression> {
    /**
     * Gets the template head.
     */
    getHead(): TemplateHead {
        return this._getNodeFromCompilerNode(this.compilerNode.head);
    }

    /**
     * Gets the template spans.
     */
    getTemplateSpans() {
        return this.compilerNode.templateSpans.map(s => this._getNodeFromCompilerNode(s));
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
        const parent = this.getParentSyntaxList() ?? this.getParentOrThrow();
        replaceNodeText({
            sourceFile: this._sourceFile,
            start: this.getStart() + 1,
            replacingLength: this.getWidth() - 2,
            newText: value
        });

        return parent.getChildAtIndex(childIndex) as TemplateLiteral;
    }
}
