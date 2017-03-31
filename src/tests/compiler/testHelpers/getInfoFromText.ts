import * as ts from "typescript";
import {TsSimpleAst} from "./../../../TsSimpleAst";
import {Node} from "./../../../compiler";

/**
 * @internal
 */
export function getInfoFromText<TFirstChild extends Node<ts.Node>>(text: string, opts?: { isDefinitionFile: boolean; }) {
    const {isDefinitionFile = false} = opts || {};
    const tsSimpleAst = new TsSimpleAst();
    const sourceFile = tsSimpleAst.createSourceFileFromText(isDefinitionFile ? "testFile.d.ts" : "testFile.ts", text);
    const firstChild = sourceFile.getMainChildren()[0] as TFirstChild;
    return { tsSimpleAst, sourceFile, firstChild };
}
