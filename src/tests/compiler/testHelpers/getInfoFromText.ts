import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import {TsSimpleAst} from "./../../../TsSimpleAst";
import {createWrappedNode} from "./../../../createWrappedNode";
import {FileSystemHost, DefaultFileSystemHost, VirtualFileSystemHost} from "./../../../fileSystem";
import {Node, SourceFile, Diagnostic, Program} from "./../../../compiler";

function getTextForLibFile(fileName: string) {
    return {
        filePath: path.join("node_modules/typescript/lib", fileName),
        text: fs.readFileSync(path.join(__dirname, "../../../../node_modules/typescript/lib", fileName), "utf-8")
    };
}

const libFileNames = [
    "lib.d.ts",
    "lib.es2017.full.d.ts",
    "lib.es2017.object.d.ts",
    "lib.es2017.sharedmemory.d.ts",
    "lib.es2017.string.d.ts",
    "lib.es2017.intl.d.ts",
    "lib.es2016.d.ts",
    "lib.es2015.d.ts",
    "lib.es2015.core.d.ts",
    "lib.es2015.collection.d.ts",
    "lib.es2015.generator.d.ts",
    "lib.es2015.promise.d.ts",
    "lib.es2015.iterable.d.ts",
    "lib.es2015.proxy.d.ts",
    "lib.es2015.reflect.d.ts",
    "lib.es2015.symbol.d.ts",
    "lib.es2015.symbol.wellknown.d.ts",
    "lib.es5.d.ts"
];
const libFiles = libFileNames.map(name => getTextForLibFile(name));

/** @internal */
export interface GetInfoFromTextOptions {
    isDefinitionFile?: boolean;
    filePath?: string;
    host?: FileSystemHost;
    disableErrorCheck?: boolean;
    compilerOptions?: ts.CompilerOptions;
    includeLibDts?: boolean;
    isJsx?: boolean;
}

/** @internal */
export function getInfoFromText<TFirstChild extends Node>(text: string, opts?: GetInfoFromTextOptions) {
    const info = getInfoFromTextInternal(text, opts);
    return {
        ...info,
        firstChild: info.sourceFile.getChildSyntaxListOrThrow().getChildren()[0] as TFirstChild
    };
}

export function getInfoFromTextWithDescendant<TDescendant extends Node>(text: string, descendantKind: ts.SyntaxKind, opts?: GetInfoFromTextOptions) {
    const info = getInfoFromTextInternal(text, opts);
    return {
        ...info,
        descendant: info.sourceFile.getFirstDescendantByKindOrThrow(descendantKind) as TDescendant
    };
}

function getInfoFromTextInternal(text: string, opts?: GetInfoFromTextOptions) {
    // tslint:disable-next-line:no-unnecessary-initializer -- tslint not realizing undefined is required
    const {isDefinitionFile = false, isJsx = false, filePath = undefined, host = new VirtualFileSystemHost(), disableErrorCheck = false,
        compilerOptions = { target: ts.ScriptTarget.ES2017 }, includeLibDts = false} = opts || {};

    if (includeLibDts) {
        for (const libFile of libFiles)
            host.writeFileSync(libFile.filePath, libFile.text);
    }

    const tsSimpleAst = new TsSimpleAst({ compilerOptions }, host);
    const sourceFile = tsSimpleAst.createSourceFile(getFilePath(), text);

    // disabled because the tests will run out of memory (I believe this is a ts compiler issue)
    /*
    if (!disableErrorCheck)
        ensureNoCompileErrorsInSourceFile(sourceFile);
    */

    return {tsSimpleAst, sourceFile};

    function getFilePath() {
        if (filePath != null)
            return filePath;
        if (isJsx)
            return "testFile.tsx";
        return isDefinitionFile ? "testFile.d.ts" : "testFile.ts";
    }
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
