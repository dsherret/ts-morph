import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { JsxTagNamedNodeStructure } from "../../../../structures";
import { callBaseSet } from "../../callBaseSet";
import { callBaseGetStructure } from "../../callBaseGetStructure";
import { JsxTagNameExpression } from "../../aliases";
import { Node } from "../../common";

export type JsxTagNamedNodeExtensionType = Node<ts.Node & { tagName: ts.JsxTagNameExpression; }>;

export interface JsxTagNamedNode {
    /**
     * Gets the tag name of the JSX closing element.
     */
    getTagNameNode(): JsxTagNameExpression;
}

export function JsxTagNamedNode<T extends Constructor<JsxTagNamedNodeExtensionType>>(Base: T): Constructor<JsxTagNamedNode> & T {
    return class extends Base implements JsxTagNamedNode {
        /**
         * Gets the tag name of the JSX element.
         */
        getTagNameNode() {
            return this._getNodeFromCompilerNode(this.compilerNode.tagName) as JsxTagNameExpression;
        }

        set(structure: Partial<JsxTagNamedNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.name != null)
                this.getTagNameNode().replaceWithText(structure.name);

            return this;
        }

        getStructure(): JsxTagNamedNodeStructure {
            return callBaseGetStructure<JsxTagNamedNodeStructure>(Base.prototype, this, {
                name: this.getTagNameNode().getText()
            });
        }
    };
}
