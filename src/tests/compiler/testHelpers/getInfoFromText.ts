import * as ts from "typescript";
import {TsSimpleAst} from "./../../../TsSimpleAst";
import {DefaultFileSystemHost} from "./../../../DefaultFileSystemHost";
import {Node} from "./../../../compiler";

const defaultHost = new DefaultFileSystemHost();
const pastReadFile = defaultHost.readFile;
const fileMap = new Map<string, string>();
defaultHost.readFile = (filePath) => {
    // cache any file reads
    if (!fileMap.has(filePath))
        fileMap.set(filePath, pastReadFile.call(defaultHost, filePath));

    return fileMap.get(filePath)!;
};

/**
 * @internal
 */
export function getInfoFromText<TFirstChild extends Node<ts.Node>>(text: string, opts?: { isDefinitionFile: boolean; }) {
    const {isDefinitionFile = false} = opts || {};
    const tsSimpleAst = new TsSimpleAst(undefined, defaultHost);
    const sourceFile = tsSimpleAst.createSourceFileFromText(isDefinitionFile ? "testFile.d.ts" : "testFile.ts", text);
    const firstChild = sourceFile.getMainChildren()[0] as TFirstChild;
    return { tsSimpleAst, sourceFile, firstChild };
}
