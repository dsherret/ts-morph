import {Constructor} from "./../../../Constructor";
import * as errors from "./../../../errors";
import {getNodeByNameOrFindFunction} from "./../../../utils";
import {Node} from "./../../common";
import {ts, SyntaxKind} from "./../../../typescript";
import {JsxAttributeLike} from "./../../aliases";

export type JsxAttributedNodeExtensionType = Node<ts.Node & { attributes: ts.JsxAttributes; }>;

export interface JsxAttributedNode {
    /**
     * Gets the JSX element's attributes.
     */
    getAttributes(): JsxAttributeLike[];
    /**
     * Gets an attribute by name or returns undefined when it can't be found.
     * @param name - Name to search for.
     */
    getAttribute(name: string): JsxAttributeLike | undefined;
    /**
     * Gets an attribute by a find function or returns undefined when it can't be found.
     * @param findFunction - Find function.
     */
    getAttribute(findFunction: (attribute: JsxAttributeLike) => boolean): JsxAttributeLike | undefined;
}

export function JsxAttributedNode<T extends Constructor<JsxAttributedNodeExtensionType>>(Base: T): Constructor<JsxAttributedNode> & T {
    return class extends Base implements JsxAttributedNode {
        getAttributes() {
            return this.compilerNode.attributes.properties.map(p => this.getNodeFromCompilerNode<JsxAttributeLike>(p));
        }

        getAttribute(nameOrFindFunction: (string | ((attribute: JsxAttributeLike) => boolean))) {
            return getNodeByNameOrFindFunction(this.getAttributes(), nameOrFindFunction);
        }
    };
}
