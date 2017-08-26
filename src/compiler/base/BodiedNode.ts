import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {insertIntoParent} from "./../../manipulation";
import {BodiedNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";

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

/**
 * @internal
 */
export function setBodyTextForNode(body: Node, text: string) {
    const childSyntaxList = body.getChildSyntaxListOrThrow();
    const childrenToRemove = childSyntaxList.getChildren();
    const childIndentationText = body.getChildIndentationText();
    const newLineKind = body.global.manipulationSettings.getNewLineKind();
    const newText = (text.length > 0 ? newLineKind + text.split(/\r?\n/).map(t => t.length > 0 ? childIndentationText + t : t).join(newLineKind) : "") +
        newLineKind + body.getParentOrThrow().getIndentationText();
    const openBrace = body.getFirstChildByKindOrThrow(ts.SyntaxKind.FirstPunctuation);
    const closeBrace = body.getFirstChildByKindOrThrow(ts.SyntaxKind.CloseBraceToken);

    // ideally this wouldn't replace the existing syntax list
    insertIntoParent({
        insertPos: childSyntaxList.getPos(),
        childIndex: childSyntaxList.getChildIndex(),
        insertItemsCount: 1,
        newText,
        parent: body,
        replacing: {
            length: closeBrace.getStart() - openBrace.getEnd(),
            nodes: [childSyntaxList]
        }
    });
}
