import * as ts from "typescript";
import {Memoize} from "./../utils/decorators";
import {CompilerFactory} from "./../factories";
import {TsSourceFile} from "./TsSourceFile";

export class TsNode<T extends ts.Node> {
    constructor(protected readonly factory: CompilerFactory, protected readonly node: T, protected readonly parent: TsNode<ts.Node> | null) {
    }

    setText(newText: string) {
        ts.updateSourceFile(this.sourceFile, newText, this.node)
    }

    getText() {
        return this.node.getText();
    }

    getCompilerNode() {
        return this.node;
    }

    private closest(search: (node: TsNode<ts.Node>) => boolean) {
        // todo
    }
}
