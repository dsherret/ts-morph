import * as ts from "typescript";
import {TsSimpleAst} from "./../../../TsSimpleAst";
import {TsNode} from "./../../../compiler";

export function getInfoFromText<TFirstChild extends TsNode<ts.Node>>(text: string) {
    const tsSimpleAst = new TsSimpleAst();
    const tsSourceFile = tsSimpleAst.createSourceFileFromText("testFile.ts", text);
    const tsFirstChild = tsSourceFile.getMainChildren()[0] as TFirstChild;
    return { tsSimpleAst, tsSourceFile, tsFirstChild };
}
