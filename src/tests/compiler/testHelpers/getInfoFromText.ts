import * as ts from "typescript";
import {TsSimpleAst} from "./../../../TsSimpleAst";
import {DefaultFileSystemHost} from "./../../../DefaultFileSystemHost";
import {FileSystemHost} from "./../../../FileSystemHost";
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
export function getInfoFromText<TFirstChild extends Node<ts.Node>>(text: string, opts?: { isDefinitionFile?: boolean; filePath?: string; host?: FileSystemHost }) {
    const {isDefinitionFile = false, filePath = undefined, host = defaultHost} = opts || {};
    const tsSimpleAst = new TsSimpleAst(undefined, host);
    const sourceFile = tsSimpleAst.addSourceFileFromText(filePath || (isDefinitionFile ? "testFile.d.ts" : "testFile.ts"), text);
    const firstChild = sourceFile.getMainChildren()[0] as TFirstChild;
    return { tsSimpleAst, sourceFile, firstChild };
}
