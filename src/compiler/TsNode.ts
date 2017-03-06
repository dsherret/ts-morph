import * as ts from "typescript";
import {Memoize, ArrayUtils} from "./../utils";
import {CompilerFactory} from "./../factories";
import {TsSourceFile} from "./TsSourceFile";

export class TsNode<NodeType extends ts.Node> {
    constructor(
        protected readonly factory: CompilerFactory,
        protected node: NodeType
    ) {
    }

    getCompilerNode() {
        return this.node;
    }

    containsChildBasedOnPosition(child: TsNode<ts.Node>) {
        return this.containsRange(child.getStartPosition(), child.getEndPosition());
    }

    containsRange(startPosition: number, endPosition: number) {
        return this.getStartPosition() <= startPosition && endPosition <= this.getEndPosition();
    }

    addChild(child: TsNode<ts.Node>) {
        if (child.node.parent != null)
            child.detatchParent();

        child.node.parent = this.node;
        const children = (this.node as any)._children as ts.Node[];
        if (children != null)
            children.push(child.node);
        const statements = (this.node as any).statements as ts.Node[];
        if (statements != null)
            statements.push(child.node);
        const offset = child.node.end - child.node.pos;
        this.node.end += offset;

        const parent = this.getParent();
        if (parent == null)
            return;

        parent.getChildrenAfter(this).forEach(nextParentChild => nextParentChild.offsetPositions(offset));
    }

    detatchParent() {
        const parent = this.getParent();
        if (parent == null)
            return;

        parent.removeChild(this);
        this.node.pos = 0;
        this.node.end = length;
        this.node.parent = undefined;
    }

    removeChild(childToRemove: TsNode<ts.Node>) {
        const topParent = this.getTopParent()!;
        const pos = this.node.pos;
        const end = this.node.end;
        for (let child of this.getChildren()) {
            if (childToRemove === child) {
                const children = (this.node as any)._children as ts.Node[];
                ArrayUtils.removeFirst(children, childToRemove.node);
                const statements = (this.node as any).statements as ts.Node[];
                ArrayUtils.removeFirst(statements, childToRemove.node);
                return;
            }

            if (child.containsChildBasedOnPosition(childToRemove))
                this.removeChild(childToRemove);
        }

        topParent.replaceText(pos, end, "");
    }

    replaceText(replaceStart: number, replaceEnd: number, newText: string) {
        // todo: optimize
        const currentStart = this.node.pos;
        const difference = newText.length - (replaceEnd - replaceStart);

        if (this.containsRange(replaceStart, replaceEnd)) {
            const text = (this.node as any).text as string | undefined;
            if (text != null) {
                const relativeStart = replaceStart - currentStart;
                const relativeEnd = replaceEnd - currentStart;
                (this.node as any).text = text.substring(0, relativeStart) + newText + text.substring(relativeEnd);
            }
            this.node.end += difference;
        }
        else if (currentStart > replaceStart) {
            this.node.pos += difference;
            this.node.end += difference;
        }

        this.getChildren().forEach(child => child.replaceText(replaceStart, replaceEnd, newText));
    }

    offsetPositions(offset: number) {
        this.node.pos += offset;
        this.node.end += offset;

        for (let child of this.getChildren()) {
            child.offsetPositions(offset);
        }
    }

    getChildrenAfter(tsNode: TsNode<ts.Node>) {
        // todo: optimize
        const nextChildren: TsNode<ts.Node>[] = [];
        let foundChild = false;

        for (let child of this.getChildren()) {
            if (!foundChild) {
                foundChild = child === tsNode;
                continue;
            }

            nextChildren.push(child);
        }

        return nextChildren;
    }

    getChildren() {
        return this.node.getChildren().map(c => this.factory.getTsNodeFromNode(c));
    }

    getMainChildren() {
        const childNodes: TsNode<ts.Node>[] = [];
        ts.forEachChild(this.node, childNode => {
            childNodes.push(this.factory.getTsNodeFromNode(childNode));
        });
        return childNodes;
    }

    getAllChildren() {
        const children = [...this.getChildren()];
        children.map(c => c.getAllChildren()).forEach(c => children.push(...c));
        return children;
    }

    getStartPosition() {
        return this.node.pos;
    }

    getEndPosition() {
        return this.node.end;
    }

    getText() {
        return this.node.getText();
    }

    replaceCompilerNode(node: NodeType) {
        this.node = node;
    }

    getSourceFile() {
        const topParent = this.getTopParent();
        return (topParent != null && topParent.isSourceFile() ? topParent : null) as TsSourceFile | null;
    }

    getTopParent() {
        let parent = this as TsNode<ts.Node> | null;
        let nextParent = parent!.getParent();
        while (nextParent != null) {
            parent = nextParent;
            nextParent = parent!.getParent();
        }

        return (parent === this) ? null : parent;
    }

    getParent() {
        return (this.node.parent == null) ? null : this.factory.getTsNodeFromNode(this.node.parent);
    }

    ensureChildrenParentSet() {
        const children = this.getChildren();
        for (let child of children) {
            child.getCompilerNode().parent = this.node;
            child.ensureChildrenParentSet();
        }
    }

    isSourceFile() {
        return false;
    }

    private closest(search: (node: TsNode<ts.Node>) => boolean) {
        // todo
    }
}
