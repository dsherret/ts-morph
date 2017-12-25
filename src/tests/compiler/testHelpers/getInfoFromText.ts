import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import {TsSimpleAst} from "./../../../TsSimpleAst";
import {createWrappedNode} from "./../../../createWrappedNode";
import {FileSystemHost, DefaultFileSystemHost, VirtualFileSystemHost} from "./../../../fileSystem";
import {Node, SourceFile, Diagnostic, Program} from "./../../../compiler";

function getTextForLibFile(filePath: string) {
    return {
        filePath,
        text: fs.readFileSync(path.join(__dirname, "../../../../", filePath), "utf-8")
    };
}

const libFiles = [
    getTextForLibFile("node_modules/typescript/lib/lib.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2017.full.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2017.object.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2017.sharedmemory.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2017.string.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2017.intl.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2016.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2015.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2015.core.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2015.collection.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2015.generator.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2015.promise.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2015.iterable.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2015.proxy.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2015.reflect.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2015.symbol.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts"),
    getTextForLibFile("node_modules/typescript/lib/lib.es5.d.ts")
];

/** @internal */
export interface GetInfoFromTextOptions {
    isDefinitionFile?: boolean;
    filePath?: string;
    host?: FileSystemHost;
    disableErrorCheck?: boolean;
    compilerOptions?: ts.CompilerOptions;
    includeLibDts?: boolean;
}

/** @internal */
export function getInfoFromText<TFirstChild extends Node>(text: string, opts?: GetInfoFromTextOptions) {
    // tslint:disable-next-line:no-unnecessary-initializer -- tslint not realizing undefined is required
    const {isDefinitionFile = false, filePath = undefined, host = new VirtualFileSystemHost(), disableErrorCheck = false, compilerOptions = { target: ts.ScriptTarget.ES2017 },
        includeLibDts = false} = opts || {};

    if (includeLibDts) {
        for (const libFile of libFiles)
            host.writeFileSync(libFile.filePath, libFile.text);
    }

    const tsSimpleAst = new TsSimpleAst({ compilerOptions }, host);
    const sourceFile = tsSimpleAst.createSourceFile(filePath || (isDefinitionFile ? "testFile.d.ts" : "testFile.ts"), text);
    const firstChild = sourceFile.getChildSyntaxListOrThrow().getChildren()[0] as TFirstChild;

    // disabled because the tests will run out of memory (I believe this is a ts compiler issue)
    /*
    if (!disableErrorCheck)
        ensureNoCompileErrorsInSourceFile(sourceFile);
    */

    return {tsSimpleAst, sourceFile, firstChild};
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
