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

        return parent != null && parent.isSourceFile() ? parent : null;
    }

    getParent() {
        return this.parent;
    }

    isSourceFile() {
        return true;
    }

    private closest(search: (node: TsNode<ts.Node>) => boolean) {
        // todo
    }
}
