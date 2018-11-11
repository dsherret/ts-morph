import * as errors from "../../../errors";
import { insertIntoParentTextRange } from "../../../manipulation";
import { BodyableNodeStructure } from "../../../structures";
import { Constructor, WriterFunction } from "../../../types";
import { SyntaxKind, ts } from "../../../typescript";
import { callBaseSet } from "../callBaseSet";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { Node } from "../common/Node";
import { getBodyTextWithoutLeadingIndentation, setBodyTextForNode } from "./helpers";

export type BodyableNodeExtensionType = Node<ts.Node & { body?: ts.Node; }>;

export interface BodyableNode {
    /**
     * Gets the body or throws an error if it doesn't exist.
     */
    getBodyOrThrow(): Node;
    /**
     * Gets the body if it exists.
     */
    getBody(): Node | undefined;
    /**
     * Gets the body text without leading whitespace, leading indentation, or trailing whitespace. Returns undefined if there is no body.
     */
    getBodyText(): string | undefined;
    /**
     * Gets if the node has a body.
     */
    hasBody(): boolean;
    /**
     * Sets the body text. A body is required to do this operation.
     * @param textOrWriterFunction - Text or writer function to set as the body.
     */
    setBodyText(textOrWriterFunction: string | WriterFunction): this;
    /**
     * Adds a body if it doesn't exists.
     */
    addBody(): this;
    /**
     * Removes the body if it exists.
     */
    removeBody(): this;
}

export function BodyableNode<T extends Constructor<BodyableNodeExtensionType>>(Base: T): Constructor<BodyableNode> & T {
    return class extends Base implements BodyableNode {
        getBodyOrThrow() {
            return errors.throwIfNullOrUndefined(this.getBody(), "Expected to find the node's body.");
        }

        getBody() {
            return this._getNodeFromCompilerNodeIfExists(this.compilerNode.body);
        }

        getBodyText() {
            const body = this.getBody();
            return body == null ? undefined : getBodyTextWithoutLeadingIndentation(body);
        }

        setBodyText(textOrWriterFunction: string | WriterFunction) {
            this.addBody();
            setBodyTextForNode(this.getBodyOrThrow(), textOrWriterFunction);
            return this;
        }

        hasBody() {
            return this.compilerNode.body != null;
        }

        addBody() {
            if (this.hasBody())
                return this;

            const semiColon = this.getLastChildByKind(SyntaxKind.SemicolonToken);

            insertIntoParentTextRange({
                parent: this,
                insertPos: semiColon == null ? this.getEnd() : semiColon.getStart(),
                newText: this._getWriterWithQueuedIndentation().block().toString(),
                replacing: {
                    textLength: semiColon == null ? 0 : semiColon.getFullWidth()
                }
            });

            return this;
        }

        removeBody() {
            const body = this.getBody();
            if (body == null)
                return this;

            insertIntoParentTextRange({
                parent: this,
                insertPos: body.getPos(),
                newText: ";",
                replacing: {
                    textLength: body.getFullWidth()
                }
            });

            return this;
        }

        set(structure: Partial<BodyableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.bodyText != null)
                this.setBodyText(structure.bodyText);
            else if (structure.hasOwnProperty(nameof(structure.bodyText)))
                this.removeBody();

            return this;
        }

        getStructure() {
            return callBaseGetStructure<BodyableNodeStructure>(Base.prototype, this, {
                bodyText: this.getBodyText()
            });
        }
    };
}
