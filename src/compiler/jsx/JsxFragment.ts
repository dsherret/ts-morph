import { ts } from "../../typescript";
import { JsxChild } from "../aliases";
import { PrimaryExpression } from "../expression";
import { JsxClosingFragment } from "./JsxClosingFragment";
import { JsxOpeningFragment } from "./JsxOpeningFragment";

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
