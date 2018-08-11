import * as objectAssign from "object-assign";
import * as errors from "../../errors";
import { getRangeFromArray, insertIntoParentTextRange, verifyAndGetIndex } from "../../manipulation";
import { Constructor } from "../../types";
import { SyntaxKind } from "../../typescript";
import { ArrayUtils } from "../../utils";
import { BodyableNode, NamedNode } from "../base";
import { Node } from "../common";

export type OverloadableNodeExtensionType = Node & BodyableNode;

/**
 * Node that supports overloads.
 */
export interface OverloadableNode {
    /**
     * Gets all the overloads associated with this node.
     */
    getOverloads(): this[];
    /**
     * Gets the implementation or undefined if it doesn't exist.
     */
    getImplementation(): this | undefined;
    /**
     * Gets the implementation or throws if it doesn't exist.
     */
    getImplementationOrThrow(): this;
    /**
     * Gets if this is an overload.
     */
    isOverload(): boolean;
    /**
     * Gets if this is the implementation.
     */
    isImplementation(): boolean;
}

export function OverloadableNode<T extends Constructor<OverloadableNodeExtensionType>>(Base: T): Constructor<OverloadableNode> & T {
    return class extends Base implements OverloadableNode {
        getOverloads(): this[] {
            return getOverloadsAndImplementation(this).filter(n => n.isOverload()) as this[];
        }

        getImplementation(): this | undefined {
            if (this.isImplementation())
                return this;
            return ArrayUtils.find(getOverloadsAndImplementation(this), n => n.isImplementation()) as this | undefined;
        }

        getImplementationOrThrow(): this {
            return errors.throwIfNullOrUndefined(this.getImplementation(), "Expected to find a corresponding implementation for the overload.");
        }

        isOverload() {
            return !this.isImplementation();
        }

        isImplementation() {
            return this.getBody() != null;
        }
    };
}

function getOverloadsAndImplementation(node: OverloadableNodeExtensionType & OverloadableNode) {
    const parentSyntaxList = node.getParentSyntaxListOrThrow();
    const name = getNameIfNamedNode(node);
    const kind = node.getKind();
    return parentSyntaxList.getChildren().filter(n => {
        const hasSameName = getNameIfNamedNode(n) === name;
        const hasSameKind = n.getKind() === kind;
        return hasSameName && hasSameKind;
    }) as (OverloadableNodeExtensionType & OverloadableNode)[];
}

function getNameIfNamedNode(node: Node) {
    const nodeAsNamedNode = (node as any as NamedNode);
    if (nodeAsNamedNode.getName instanceof Function)
        return nodeAsNamedNode.getName();
    return undefined;
}

/**
 * @internal
 */
export interface InsertOverloadsOptions<TNode extends OverloadableNode & Node, TStructure> {
    node: TNode;
    index: number;
    structures: TStructure[];
    childCodes: string[];
    getThisStructure: (node: TNode) => TStructure;
    fillNodeFromStructure: (node: TNode, structure: TStructure) => void;
    expectedSyntaxKind: SyntaxKind;
}

/**
 * @internal
 */
export function insertOverloads<TNode extends OverloadableNode & Node, TStructure>(opts: InsertOverloadsOptions<TNode, TStructure>): TNode[] {
    if (opts.structures.length === 0)
        return [];

    const overloads = opts.node.getOverloads();
    const overloadsCount = overloads.length;
    const parentSyntaxList = opts.node.getParentSyntaxListOrThrow();
    const firstIndex = overloads.length > 0 ? overloads[0].getChildIndex() : opts.node.getChildIndex();
    const index = verifyAndGetIndex(opts.index, overloadsCount);
    const mainIndex = firstIndex + index;

    const thisStructure = opts.getThisStructure(opts.node.getImplementation() || opts.node);
    const structures = opts.structures;

    for (let i = 0; i < structures.length; i++) {
        structures[i] = objectAssign(objectAssign({}, thisStructure), structures[i]);
        // structures[i] = {...thisStructure, ...structures[i]}; // not supported by TS as of 2.4.1
    }

    const indentationText = opts.node.getIndentationText();
    const newLineKind = opts.node.context.manipulationSettings.getNewLineKindAsString();

    insertIntoParentTextRange({
        parent: parentSyntaxList,
        insertPos: opts.node.getNonWhitespaceStart(),
        newText: opts.childCodes.map((c, i) => (i > 0 ? indentationText : "") + c).join(newLineKind) + newLineKind + indentationText
    });

    const children = getRangeFromArray<TNode>(parentSyntaxList.getChildren(), mainIndex, structures.length, opts.expectedSyntaxKind);
    // todo: Do not fill here... this should be printed
    children.forEach((child, i) => {
        opts.fillNodeFromStructure(child, structures[i]);
    });
    return children;
}
