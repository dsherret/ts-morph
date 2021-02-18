import { CompilerOptions, FileSystemHost, InMemoryFileSystemHost, RealFileSystemHost, SyntaxKind, ts } from "@ts-morph/common";
import { IsAny } from "conditional-type-checks";
import * as path from "path";
import { Node, SourceFile } from "../../../compiler";
import { Project } from "../../../Project";
const fileSystem = new RealFileSystemHost();

function getTextForLibFile(fileName: string) {
    return {
        filePath: path.join("node_modules/typescript/lib", fileName),
        text: fileSystem.readFileSync(path.join(getCompilerLibFolder(ts.version), fileName)),
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

export interface GetInfoFromTextOptions {
    isDefinitionFile?: boolean;
    filePath?: string;
    host?: FileSystemHost;
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
        firstChild: info.sourceFile.forEachChild(child => child) as any,
    };
}

// todo: use the mapping between syntax kind and nodes for the descendant
export function getInfoFromTextWithDescendant<TDescendant extends Node>(
    text: string,
    descendantKind: SyntaxKind,
    opts?: GetInfoFromTextOptions,
): GetInfoFromTextWithDescendantResult<TDescendant> {
    const info = getInfoFromTextInternal(text, opts);
    return {
        ...info,
        descendant: info.sourceFile.getFirstDescendantByKindOrThrow(descendantKind) as any,
    };
}

function getInfoFromTextInternal(text: string, opts?: GetInfoFromTextOptions) {
    const {
        isDefinitionFile = false,
        isJsx = false,
        filePath = undefined,
        host = new InMemoryFileSystemHost(),
        compilerOptions = undefined,
        includeLibDts = false,
    } = opts || {};

    const project = new Project({ compilerOptions, fileSystem: host, skipLoadingLibFiles: !includeLibDts });
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
