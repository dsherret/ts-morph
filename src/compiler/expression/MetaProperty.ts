import * as ts from "typescript";
import {PrimaryExpression} from "./PrimaryExpression";
import {NamedNode} from "./../base";

export const MetaPropertyBase = NamedNode(PrimaryExpression);
export class MetaProperty extends MetaPropertyBase<ts.MetaProperty> {
    /**
     * Gets the keyword token.
     */
    getKeywordToken() {
        return this.compilerNode.keywordToken;
    }
}
