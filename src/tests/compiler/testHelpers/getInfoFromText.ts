import * as fs from "fs";
import * as path from "path";
import { Project } from "../../../Project";
import { FileSystemHost, DefaultFileSystemHost, VirtualFileSystemHost } from "../../../fileSystem";
import { ts, SyntaxKind, CompilerOptions, ScriptTarget } from "../../../typescript";
import { Node, SourceFile, Diagnostic, Program } from "../../../compiler";

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
    compilerOptions?: CompilerOptions;
    languageVersion?: ScriptTarget;
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

export function getInfoFromTextWithDescendant<TDescendant extends Node>(text: string, descendantKind: SyntaxKind, opts?: GetInfoFromTextOptions) {
    const info = getInfoFromTextInternal(text, opts);
    return {
        ...info,
        descendant: info.sourceFile.getFirstDescendantByKindOrThrow(descendantKind) as TDescendant
    };
}

function getInfoFromTextInternal(text: string, opts?: GetInfoFromTextOptions) {
    // tslint:disable-next-line:no-unnecessary-initializer -- tslint not realizing undefined is required
    const {isDefinitionFile = false, isJsx = false, filePath = undefined, host = new VirtualFileSystemHost(), disableErrorCheck = false,
        compilerOptions = undefined, includeLibDts = false, languageVersion = undefined} = opts || {};

    if (includeLibDts) {
        for (const libFile of libFiles)
            host.writeFileSync(libFile.filePath, libFile.text);
    }

    const project = new Project({ compilerOptions }, host);
    const sourceFile = project.createSourceFile(getFilePath(), text, { languageVersion });

    return {project, sourceFile};

    function getFilePath() {
        if (filePath != null)
            return filePath;
        if (isJsx)
            return "testFile.tsx";
        return isDefinitionFile ? "testFile.d.ts" : "testFile.ts";
    }
}
