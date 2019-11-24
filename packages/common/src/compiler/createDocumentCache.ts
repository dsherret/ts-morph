import { ts, ScriptKind, ScriptTarget } from "../typescript";
import { TransactionalFileSystem, StandardizedFilePath } from "../fileSystem";
import { deepClone } from "../utils";
import { createCompilerSourceFile } from "./createCompilerSourceFile";

// The items in this file are temporarily internal because the implementation I came up
// with for document caches wasn't faster than just reparsing the files each time.

/**
 * A cache of reusable source files that can be used across projects.
 * @remarks Use `createDocumentCache` to create one of these.
 * @internal - Temporarily internal.
 */
export interface DocumentCache {
    __documentCacheBrand: undefined;
    /** @internal */
    _getCacheForFileSystem(fileSystem: TransactionalFileSystem): FileSystemSpecificDocumentCache;
}

/**
 * An item for the document cache.
 * @internal - Temporarily internal.
 */
export interface DocumentCacheItem {
    /**
     * This may be a relative path (ex. `./node_modules/package/file.js`). The path
     * will be resolved for each project based on its file system's current
     * working directory.
     */
    fileName: string;
    /**
     * The text of the file.
     */
    text: string;
}

/**
 * Creates a document cache with an initial list of files using the specified options.
 * @param files - Files to use in the cache.
 * @internal - Temporarily internal.
 */
export function createDocumentCache(files: DocumentCacheItem[]): DocumentCache {
    const cache = new InternalDocumentCache();
    cache._addFiles(files);
    return cache;
}

/** @internal */
export interface FileSystemSpecificDocumentCache {
    getDocumentIfMatch(
        filePath: StandardizedFilePath,
        scriptSnapshot: ts.IScriptSnapshot,
        scriptTarget: ScriptTarget | undefined,
        scriptKind: ScriptKind | undefined
    ): ts.SourceFile | undefined;
}

type DocumentKey = string & { _documentKeyBrand: undefined; };

class FileSystemDocumentCache implements FileSystemSpecificDocumentCache {
    private readonly absoluteToOriginalPath = new Map<StandardizedFilePath, string>();

    constructor(fileSystem: TransactionalFileSystem, private readonly documentCache: InternalDocumentCache) {
        for (const filePath of documentCache._getFilePaths())
            this.absoluteToOriginalPath.set(fileSystem.getStandardizedAbsolutePath(filePath), filePath);
    }

    getDocumentIfMatch(
        filePath: StandardizedFilePath,
        scriptSnapshot: ts.IScriptSnapshot,
        scriptTarget: ScriptTarget | undefined,
        scriptKind: ScriptKind | undefined
    ) {
        const originalFilePath = this.absoluteToOriginalPath.get(filePath);
        if (originalFilePath == null)
            return;

        return this.documentCache._getDocumentIfMatch(originalFilePath, filePath, scriptSnapshot, scriptTarget, scriptKind);
    }
}

class InternalDocumentCache implements DocumentCache {
    __documentCacheBrand: undefined;

    private readonly _fileTexts = new Map<string, string>();
    private readonly _documents = new Map<DocumentKey, ts.SourceFile>();

    _addFiles(files: DocumentCacheItem[]) {
        for (const file of files)
            this._fileTexts.set(file.fileName, file.text);
    }

    _getFilePaths() {
        return this._fileTexts.keys();
    }

    _getCacheForFileSystem(fileSystem: TransactionalFileSystem) {
        return new FileSystemDocumentCache(fileSystem, this);
    }

    _getDocumentIfMatch(
        filePath: string,
        absoluteFilePath: StandardizedFilePath,
        scriptSnapshot: ts.IScriptSnapshot,
        scriptTarget: ScriptTarget | undefined,
        scriptKind: ScriptKind | undefined
    ) {
        const fileText = this._fileTexts.get(filePath);
        if (fileText == null)
            return undefined; // doesn't exist in cache
        if (fileText !== scriptSnapshot.getText(0, scriptSnapshot.getLength()))
            return undefined; // not a match

        return this._getDocument(filePath, absoluteFilePath, scriptSnapshot, scriptTarget, scriptKind);
    }

    private _getDocument(
        filePath: string,
        absoluteFilePath: StandardizedFilePath,
        scriptSnapshot: ts.IScriptSnapshot,
        scriptTarget: ScriptTarget | undefined,
        scriptKind: ScriptKind | undefined
    ) {
        const documentKey = this._getKey(filePath, scriptTarget, scriptKind);
        let document = this._documents.get(documentKey);
        if (document == null) {
            document = createCompilerSourceFile(absoluteFilePath, scriptSnapshot, scriptTarget, "-1", false, scriptKind);
            this._documents.set(documentKey, document);
        }

        // ensure a clean source file is stored in the cache by always cloning this before returning
        document = deepClone(document);
        document.fileName = absoluteFilePath;

        return document;
    }

    /** @internal */
    private _getKey(filePath: string, scriptTarget: ScriptTarget | undefined, scriptKind: ScriptKind | undefined): DocumentKey {
        return (filePath + (scriptTarget?.toString() ?? "-1") + (scriptKind?.toString() ?? "-1")) as DocumentKey;
    }
}
