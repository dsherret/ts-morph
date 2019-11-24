import { FileSystemHost, RealFileSystemHost, InMemoryFileSystemHost, CompilerOptions, SyntaxKind, ts } from "@ts-morph/common";
import * as path from "path";
import { IsAny } from "conditional-type-checks";
import { Node, SourceFile } from "../../../compiler";
import { Project } from "../../../Project";
const fileSystem = new RealFileSystemHost();

function getTextForLibFile(fileName: string) {
    return {
        filePath: path.join("node_modules/typescript/lib", fileName),
        text: fileSystem.readFileSync(path.join(getCompilerLibFolder(ts.version), fileName))
    };
}

const versionLibFolder = new Map<string, string>();
function getCompilerLibFolder(version: string) {
    if (!versionLibFolder.has(version))
        versionLibFolder.set(version, getFolder());

    return versionLibFolder.get(version)!;

    function getFolder() {
        const basePath = path.join(__dirname, `../../../../../common/node_modules/`);
        const versionPath = path.join(basePath, `typescript-${version}/lib`);
        if (fileSystem.directoryExistsSync(versionPath))
            return versionPath;
        else
            return path.join(basePath, `typescript/lib`);
    }
}

const libFileNames = [
    "lib.d.ts",
    "lib.dom.d.ts",
    "lib.scripthost.d.ts",
    "lib.webworker.importscripts.d.ts",
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

export interface GetInfoFromTextOptions {
    isDefinitionFile?: boolean;
    filePath?: string;
    host?: FileSystemHost;
    disableErrorCheck?: boolean;
    compilerOptions?: CompilerOptions;
    includeLibDts?: boolean;
    isJsx?: boolean;
}

export interface GetInfoFromTextResult<TFirstChild extends Node> extends GetInfoFromTextInternalResult {
    // typescript bug fix in ts 3.5.1 (todo: check if this works by removing the conditional type in a future version)
    firstChild: IsAny<TFirstChild> extends true ? Node : TFirstChild;
}

export interface GetInfoFromTextWithDescendantResult<TDescendant extends Node> extends GetInfoFromTextInternalResult {
    // typescript bug fix in ts 3.5.1 (todo: check if this works by removing the conditional type in a future version)
    descendant: IsAny<TDescendant> extends true ? Node : TDescendant;
}

export interface GetInfoFromTextInternalResult {
    project: Project;
    sourceFile: SourceFile;
}

// I know type parameters aren't supposed to be used this way, but it's way too convenient
export function getInfoFromText<TFirstChild extends Node = Node>(text: string, opts?: GetInfoFromTextOptions): GetInfoFromTextResult<TFirstChild> {
    const info = getInfoFromTextInternal(text, opts);

    return {
        ...info,
        firstChild: info.sourceFile.forEachChild(child => child) as any
    };
}

// todo: use the mapping between syntax kind and nodes for the descendant
export function getInfoFromTextWithDescendant<TDescendant extends Node>(
    text: string,
    descendantKind: SyntaxKind,
    opts?: GetInfoFromTextOptions
): GetInfoFromTextWithDescendantResult<TDescendant> {
    const info = getInfoFromTextInternal(text, opts);
    return {
        ...info,
        descendant: info.sourceFile.getFirstDescendantByKindOrThrow(descendantKind) as any
    };
}

function getInfoFromTextInternal(text: string, opts?: GetInfoFromTextOptions) {
    const {
        isDefinitionFile = false,
        isJsx = false,
        filePath = undefined,
        host = new InMemoryFileSystemHost({ skipLoadingLibFiles: true }),
        disableErrorCheck = false,
        compilerOptions = undefined,
        includeLibDts = false
    } = opts || {};

    if (includeLibDts) {
        for (const libFile of libFiles)
            host.writeFileSync(libFile.filePath, libFile.text);
    }

    const project = new Project({ compilerOptions, fileSystem: host });
    const sourceFile = project.createSourceFile(getFilePath(), text);

    return { project, sourceFile };

    function getFilePath() {
        if (filePath != null)
            return filePath;
        if (isJsx)
            return "testFile.tsx";
        return isDefinitionFile ? "testFile.d.ts" : "testFile.ts";
    }
}
