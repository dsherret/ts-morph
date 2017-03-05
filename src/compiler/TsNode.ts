import * as ts from "typescript";
import {Memoize} from "./../utils/decorators";
import {CompilerFactory} from "./../factories";
import {TsSourceFile} from "./TsSourceFile";

export class TsNode<NodeType extends ts.Node> {
    constructor(
        protected readonly factory: CompilerFactory,
        protected node: NodeType,
        protected readonly parent: TsNode<ts.Node> | null
    ) {
    }

    getCompilerNode() {
        return this.node;
    }

    containsRange(startPosition: number, endPosition: number) {
        return this.getStartPosition() <= startPosition && this.getStartPosition() < endPosition &&
            this.getEndPosition() > startPosition && this.getEndPosition() <= endPosition;
    }

    getChildren() {
        const childNodes: TsNode<ts.Node>[] = [];
        ts.forEachChild(this.node, childNode => {
            childNodes.push(this.factory.getTsNodeFromNode(childNode, this));
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
        let parent = this as TsNode<ts.Node> | null;
        while (parent != null && !parent.isSourceFile())
            parent = parent.getParent();

        return (parent != null && parent.isSourceFile() ? parent : null) as TsSourceFile | null;
    }

    getParent() {
        return this.parent;
    }

    isSourceFile() {
        return false;
    }

    private closest(search: (node: TsNode<ts.Node>) => boolean) {
        // todo
    }
}
