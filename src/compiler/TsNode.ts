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

    getText() {
        return this.node.getText();
    }

    replaceCompilerNode(node: NodeType) {
        this.node = node;
    }

    private closest(search: (node: TsNode<ts.Node>) => boolean) {
        // todo
    }
}
