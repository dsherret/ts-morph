import { ts } from "../../typescript";
import { PrimaryExpression } from "../expression";
import { JsxChild } from "../aliases";
import { JsxOpeningFragment } from "./JsxOpeningFragment";
import { JsxClosingFragment } from "./JsxClosingFragment";

export class JsxFragment extends PrimaryExpression<ts.JsxFragment> {
    /**
     * Gets the children of the JSX fragment.
     */
    getJsxChildren(): JsxChild[] {
        return this.compilerNode.children.map(c => this.getNodeFromCompilerNode<JsxChild>(c));
    }

    /**
     * Gets the opening fragment.
     */
    getOpeningFragment() {
        return this.getNodeFromCompilerNode<JsxOpeningFragment>(this.compilerNode.openingFragment);
    }

    /**
     * Gets the closing fragment.
     */
    getClosingFragment() {
        return this.getNodeFromCompilerNode<JsxClosingFragment>(this.compilerNode.closingFragment);
    }
}
