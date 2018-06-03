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
        return this.compilerNode.children.map(c => this.getNodeFromCompilerNode(c));
    }

    /**
     * Gets the opening fragment.
     */
    getOpeningFragment(): JsxOpeningFragment {
        return this.getNodeFromCompilerNode(this.compilerNode.openingFragment);
    }

    /**
     * Gets the closing fragment.
     */
    getClosingFragment(): JsxClosingFragment {
        return this.getNodeFromCompilerNode(this.compilerNode.closingFragment);
    }
}
