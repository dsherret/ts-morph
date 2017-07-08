import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {BodyableNode, NamedNode} from "./../base";
import {Node} from "./../common";

export type OverloadableNodeExtensionType = Node & BodyableNode;

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
            return getOverloadsAndImplementation(this).find(n => n.isImplementation()) as this | undefined;
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
