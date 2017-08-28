import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {BodiedNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {setBodyTextForNode} from "./helpers/setBodyTextForNode";

export type BodiedNodeExtensionType = Node<ts.Node>;

export interface BodiedNode {
    /**
     * Gets if this is a bodyable node.
     * @internal
     */
    isBodiedNode(): this is BodiedNode;
    /**
     * Gets the body.
     */
    getBody(): Node;
    /**
     * Sets the body text.
     */
    setBodyText(text: string): this;
}

export function BodiedNode<T extends Constructor<BodiedNodeExtensionType>>(Base: T): Constructor<BodiedNode> & T {
    return class extends Base implements BodiedNode {
        isBodiedNode() {
            return true;
        }

        getBody() {
            const body = (this.compilerNode as any).body as ts.Node;
            if (body == null)
                throw new errors.InvalidOperationError("Bodied node should have a body.");

            return this.global.compilerFactory.getNodeFromCompilerNode(body, this.sourceFile);
        }

        setBodyText(text: string) {
            const body = this.getBody();
            setBodyTextForNode(body, text);
            return this;
        }

        fill(structure: Partial<BodiedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.bodyText != null)
                this.setBodyText(structure.bodyText);

            return this;
        }
    };
}
