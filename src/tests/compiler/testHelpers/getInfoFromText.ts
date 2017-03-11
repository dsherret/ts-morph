import {TsSimpleAst} from "./../../../TsSimpleAst";

export function getInfoFromText(text: string) {
    const tsSimpleAst = new TsSimpleAst();
    const tsSourceFile = tsSimpleAst.createSourceFileFromText("testFile.ts", text).getTsNode();
    const tsFirstChild = tsSourceFile.getMainChildren()[0];
    return { tsSimpleAst, tsSourceFile, tsFirstChild };
}
