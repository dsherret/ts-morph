import { ts } from "@ts-morph/common";
import { replaceNodeText } from "../../../../manipulation";
import { LiteralExpression } from "../../expression";
import { TemplateExpression } from "./TemplateExpression";

export const NoSubstitutionTemplateLiteralBase = LiteralExpression;
export class NoSubstitutionTemplateLiteral extends NoSubstitutionTemplateLiteralBase<ts.NoSubstitutionTemplateLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue() {
        // for consistency with other literals
        return this.compilerNode.text;
    }

    /**
     * Sets the literal value.
     *
     * Note: This could possibly replace the node if you add a tagged template.
     * @param value - Value to set.
     * @returns The new node if the kind changed; the current node otherwise.
     */
    setLiteralValue(value: string) {
        const childIndex = this.getChildIndex();
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        replaceNodeText({
            sourceFile: this._sourceFile,
            start: this.getStart() + 1,
            replacingLength: this.getWidth() - 2,
            newText: value
        });

        return parent.getChildAtIndex(childIndex) as (NoSubstitutionTemplateLiteral | TemplateExpression);
    }
}
