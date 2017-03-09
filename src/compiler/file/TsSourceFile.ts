import * as ts from "typescript";
import * as path from "path";
import {CompilerFactory} from "./../../factories";
import {TsNode} from "./../common";

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
