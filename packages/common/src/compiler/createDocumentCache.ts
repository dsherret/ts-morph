import { ts, ScriptKind, ScriptTarget } from "../typescript";
import { createCompilerSourceFile } from "./createCompilerSourceFile";
import { TransactionalFileSystem, StandardizedFilePath } from "../fileSystem";

/**
 * A cache of reusable source files that can be used across projects.
 * @remarks Use `createDocumentCache` to create one of these.
 */
export interface DocumentCache {
    __documentCacheBrand: undefined;
    /** @internal */
    _getCacheForFileSystem(fileSystem: TransactionalFileSystem): FileSystemSpecificDocumentCache;
}

/**
 * An item for the document cache.
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
 */
export function createDocumentCache(files: DocumentCacheItem[]): DocumentCache {
    return new InternalDocumentCache(files);
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

    constructor(private readonly fileSystem: TransactionalFileSystem, private readonly documentCache: InternalDocumentCache) {
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
    declare __documentCacheBrand: undefined;

    private readonly _fileTexts: Map<string, string>;
    private readonly _documents = new Map<DocumentKey, ts.SourceFile>();

    constructor(files: DocumentCacheItem[]) {
        this._fileTexts = new Map();

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
            return; // doesn't exist in cache
        if (fileText !== scriptSnapshot.getText(0, scriptSnapshot.getLength()))
            return; // not a match

        const documentKey = this._getKey(filePath, scriptTarget, scriptKind);
        let document = this._documents.get(documentKey);
        if (document == null) {
            document = createCompilerSourceFile(absoluteFilePath, scriptSnapshot, scriptTarget, "-1", scriptKind);
            console.log(document.fileName);
            this._documents.set(documentKey, document);
        }

        // ensure a clean source file is stored in the cache by always cloning this before returning
        document = cloneWithReferencesCloned(document);
        document.fileName = absoluteFilePath;

        return document;
    }

    /** @internal */
    private _getKey(filePath: string, scriptTarget: ScriptTarget | undefined, scriptKind: ScriptKind | undefined): DocumentKey {
        return (filePath + (scriptTarget?.toString() ?? "undefined") + (scriptKind?.toString() ?? "undefined")) as DocumentKey;
    }
}

function cloneWithReferencesCloned<T extends object>(originalObject: T): T {
    const references = new Map<object, object>();
    return clone(originalObject) as T;

    function clone(obj: object) {
        let newObj: object | undefined = references.get(obj);
        if (newObj == null) {
            newObj = Object.create(obj.constructor.prototype) as object;

            references.set(obj, newObj);

            for (const propName of Object.keys(obj)) {
                (newObj as any)[propName] = cloneItem((obj as any)[propName]);
            }
        }
        return newObj;
    }

    function cloneArray(array: unknown[]): unknown[] {
        return array.map(cloneItem);
    }

    function cloneItem(item: unknown) {
        if (item instanceof Array)
            return cloneArray(item);
        else if (typeof item === "object")
            return item === null ? item : clone(item);
        return item;
    }
}
