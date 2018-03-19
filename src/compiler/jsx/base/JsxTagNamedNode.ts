import {Constructor} from "../../../Constructor";
import {Node} from "../../common";
import {ts} from "../../../typescript";
import {JsxTagNameExpression} from "../../aliases";

export type JsxTagNamedNodeExtensionType = Node<ts.Node & { tagName: ts.JsxTagNameExpression; }>;

export interface JsxTagNamedNode {
    /**
     * Gets the tag name of the JSX closing element.
     */
    getTagName(): JsxTagNameExpression;
}

export function JsxTagNamedNode<T extends Constructor<JsxTagNamedNodeExtensionType>>(Base: T): Constructor<JsxTagNamedNode> & T {
    return class extends Base implements JsxTagNamedNode {
        /**
         * Gets the tag name of the JSX element.
         */
        getTagName() {
            return this.getNodeFromCompilerNode<JsxTagNameExpression>(this.compilerNode.tagName);
        }
    };
}
