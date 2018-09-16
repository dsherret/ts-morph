import * as errors from "../../errors";
import { BodiedNodeStructure } from "../../structures";
import { Constructor, WriterFunction } from "../../types";
import { ts } from "../../typescript";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { getBodyTextForStructure, setBodyTextForNode } from "./helpers";
import { callBaseGetStructure } from "../callBaseGetStructure";

export type BodiedNodeExtensionType = Node<ts.Node & { body: ts.Node; }>;

export interface BodiedNode {
    /**
     * Gets the body.
     */
    getBody(): Node;
    /**
     * Sets the body text.
     * @param textOrWriterFunction - Text or writer function to set as the body.
     */
    setBodyText(textOrWriterFunction: string | WriterFunction): this;
}

export function BodiedNode<T extends Constructor<BodiedNodeExtensionType>>(Base: T): Constructor<BodiedNode> & T {
    return class extends Base implements BodiedNode {
        getBody() {
            const body = this.compilerNode.body;
            if (body == null)
                throw new errors.InvalidOperationError("Bodied node should have a body.");

            return this.getNodeFromCompilerNode(body);
        }

        setBodyText(textOrWriterFunction: string | WriterFunction) {
            const body = this.getBody();
            setBodyTextForNode(body, textOrWriterFunction);
            return this;
        }

        set(structure: Partial<BodiedNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.bodyText != null)
                this.setBodyText(structure.bodyText);

            return this;
        }

        getStructure() {
            return callBaseGetStructure<BodiedNodeStructure>(Base.prototype, this, {
                bodyText: getBodyTextForStructure(this.getBody())
            });
        }
    };
}
