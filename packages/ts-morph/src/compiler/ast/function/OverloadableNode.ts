import { errors, ObjectUtils, SyntaxKind } from "@ts-morph/common";
import { getRangeWithoutCommentsFromArray, insertIntoParentTextRange, verifyAndGetIndex } from "../../../manipulation";
import { Structure } from "../../../structures";
import { CodeBlockWriter } from "../../../codeBlockWriter";
import { Constructor } from "../../../types";
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
     * Gets if this is not the implementation.
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
            return getOverloadsAndImplementation(this).find(n => n.isImplementation()) as this | undefined;
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
    const parent = node.getParentOrThrow();
    const name = getNameIfNamedNode(node);
    const kind = node.getKind();
    return parent.forEachChildAsArray().filter(n => {
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
export interface InsertOverloadsOptions<TNode extends OverloadableNode & Node, TStructure extends Structure> {
    node: TNode;
    index: number;
    structures: ReadonlyArray<TStructure>;
    printStructure: (writer: CodeBlockWriter, structure: TStructure) => void;
    getThisStructure: (node: TNode) => TStructure;
    expectedSyntaxKind: SyntaxKind;
}

/**
 * @internal
 */
export function insertOverloads<TNode extends OverloadableNode & Node, TStructure>(opts: InsertOverloadsOptions<TNode, TStructure>): TNode[] {
    if (opts.structures.length === 0)
        return [];

    const parentSyntaxList = opts.node.getParentSyntaxListOrThrow();
    const implementationNode = opts.node.getImplementation() || opts.node;
    const overloads = opts.node.getOverloads();
    const overloadsCount = overloads.length;
    const firstIndex = overloads.length > 0 ? overloads[0].getChildIndex() : implementationNode.getChildIndex();
    const index = verifyAndGetIndex(opts.index, overloadsCount);
    const mainIndex = firstIndex + index;

    const thisStructure = opts.getThisStructure(implementationNode);
    const structures = opts.structures.map(structure => ObjectUtils.assign(ObjectUtils.assign({}, thisStructure), structure));
    const writer = implementationNode._getWriterWithQueuedIndentation();

    // write text
    for (const structure of structures) {
        if (writer.getLength() > 0)
            writer.newLine();
        opts.printStructure(writer, structure);
    }
    writer.newLine();
    writer.write(""); // force final indentation

    insertIntoParentTextRange({
        parent: parentSyntaxList,
        insertPos: (overloads[index] || implementationNode).getNonWhitespaceStart(),
        newText: writer.toString()
    });

    return getRangeWithoutCommentsFromArray<TNode>(parentSyntaxList.getChildren(), mainIndex, structures.length, opts.expectedSyntaxKind);
}
