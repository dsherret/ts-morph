import * as ts from "typescript";
import {Memoize} from "./../utils/decorators";
import {CompilerFactory} from "./../factories";
import {TsSourceFile} from "./TsSourceFile";
import {RefreshInfo} from "./RefreshInfo";

export class TsNode<NodeType extends ts.Node> {
    constructor(
        protected readonly factory: CompilerFactory,
        protected node: NodeType,
        protected readonly parent: TsNode<ts.Node> | null,
        protected readonly parentRefreshInfo: RefreshInfo<any> | null
    ) {
    }

    getCompilerNode() {
        return this.node;
    }

    refresh(parentRefreshInfo: RefreshInfo<any>) {
        // override
    }

    replaceCompilerNode(node: NodeType) {
        this.node = node;
    }

    private closest(search: (node: TsNode<ts.Node>) => boolean) {
        // todo
    }
}
