import * as ts from "typescript";
import {TsSimpleAst} from "./../../../TsSimpleAst";
import {DefaultFileSystemHost} from "./../../../DefaultFileSystemHost";
import {FileSystemHost} from "./../../../FileSystemHost";
import {Node, SourceFile, Diagnostic, Program} from "./../../../compiler";

const defaultHost = new DefaultFileSystemHost();
const pastReadFile = defaultHost.readFile;
const fileMap = new Map<string, string>();
defaultHost.readFile = filePath => {
    // cache any file reads
    if (!fileMap.has(filePath))
        fileMap.set(filePath, pastReadFile.call(defaultHost, filePath));

    return fileMap.get(filePath)!;
};

/**
 * @internal
 */
export function getInfoFromText<TFirstChild extends Node>(text: string, opts?: { isDefinitionFile?: boolean; filePath?: string; host?: FileSystemHost; disableErrorCheck?: boolean }) {
    // tslint:disable-next-line:no-unnecessary-initializer -- tslint not realizing undefined is required
    const {isDefinitionFile = false, filePath = undefined, host = defaultHost, disableErrorCheck = false} = opts || {};
    const tsSimpleAst = new TsSimpleAst({ compilerOptions: { target: ts.ScriptTarget.ES2017 }}, host);
    const sourceFile = tsSimpleAst.addSourceFileFromText(filePath || (isDefinitionFile ? "testFile.d.ts" : "testFile.ts"), text);
    const firstChild = sourceFile.getChildSyntaxListOrThrow(sourceFile).getChildren(sourceFile)[0] as TFirstChild;

    // disabled because the tests will run out of memory (I believe this is a ts compiler issue)
    /*
    if (!disableErrorCheck)
        ensureNoCompileErrorsInSourceFile(sourceFile);
    */

    return { tsSimpleAst, sourceFile, firstChild };
}

function ensureNoCompileErrorsInSourceFile(sourceFile: SourceFile) {
    const diagnostics = sourceFile.getDiagnostics().filter(checkAllowDiagnostic);
    if (diagnostics.length === 0)
        return;

    console.log("SOURCE FILE");
    console.log("===========");
    console.log(sourceFile.getText());
    console.log("===========");

    for (const diagnostic of diagnostics) {
        console.log(diagnostic.getCode());
        console.log(diagnostic.getMessageText());
    }

    throw new Error("Compile error!");
}

function checkAllowDiagnostic(diagnostic: Diagnostic) {
    switch (diagnostic.getCode()) {
        case 7005: // no implicit any
        case 7025: // no implicit any
        case 2304: // cannot find name
        case 4020: // extends clause is using private name
        case 4019: // implements clause is using private name
            return false;
        default:
            return true;
    }
}
