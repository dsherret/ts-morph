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

    getChildren() {
        const childNodes: TsNode<ts.Node>[] = [];
        ts.forEachChild(this.node, childNode => childNodes.push(this.factory.getTsNodeFromNode(childNode, this)));
        return childNodes;
    }

    getPosition() {
        return this.node.pos;
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
