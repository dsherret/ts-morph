import * as ts from "typescript";
import {CompilerFactory} from "./../factories";
import {TsNode} from "./TsNode";

export class TsSourceFile extends TsNode<ts.SourceFile> {
    constructor(factory: CompilerFactory, sourceFile: ts.SourceFile) {
        super(factory, sourceFile, null);
    }
}
