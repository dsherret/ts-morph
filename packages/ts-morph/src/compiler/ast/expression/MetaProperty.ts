import { ts } from "@ts-morph/common";
import { NamedNode } from "../base";
import { PrimaryExpression } from "./PrimaryExpression";

export const MetaPropertyBase = NamedNode(PrimaryExpression);
export class MetaProperty extends MetaPropertyBase<ts.MetaProperty> {
    /**
     * Gets the keyword token.
     */
    getKeywordToken() {
        return this.compilerNode.keywordToken;
    }
}
