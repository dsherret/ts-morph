import * as ts from "typescript";
import {CompilerFactory} from "./../factories";
import {TsNode} from "./TsNode";
import * as path from "path";

export class TsSourceFile extends TsNode<ts.SourceFile> {
    getFileName() {
        return this.node.fileName;
    }

    getReferencedFiles() {
        const dirName = path.dirname(this.getFileName());
        return (this.node.referencedFiles || []).map(f => this.factory.getSourceFileFromFilePath(path.join(dirName, f.fileName)));
    }

    isSourceFile() {
        return true;
    }
}
