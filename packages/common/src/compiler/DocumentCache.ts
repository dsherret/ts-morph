import { ts, ScriptKind, ScriptTarget } from "../typescript";
import { createCompilerSourceFile } from "./createCompilerSourceFile";

type DocumentKey = string & { _documentKeyBrand: undefined; };

/** Options for a document cache. */
export interface DocumentCacheOptions {
    /**
     * Whether to skip cloning documents when asked for one.
     * @remarks This is slower, but faster than reparsing. Only set this to true if the source file
     * will never be modified.
     * @default false
     */
    skipCloningDocuments?: boolean;
}

/**
 * A cache of reusable source files that can be used across projects.
 */
export class DocumentCache {
    private readonly _fileTexts: Map<string, string>;
    private readonly _documents = new Map<DocumentKey, ts.SourceFile>();
    private readonly _skipCloningDocuments: boolean;

    /**
     * Creates a document cache with an initial list of files using the specified options.
     * @param files - Files to use in the cache.
     * @param options - Options for how the cache should behave.
     */
    constructor(files: [string, string][], options?: DocumentCacheOptions) {
        this._fileTexts = new Map(files);
        this._skipCloningDocuments = options?.skipCloningDocuments ?? false;
    }

    /** @internal */
    _getDocumentIfMatch(
        filePath: string,
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
            document = createCompilerSourceFile(filePath, scriptSnapshot, scriptTarget, "-1", scriptKind);
            this._documents.set(documentKey, document);
        }
        else if (!this._skipCloningDocuments) {
            document = cloneWithReferencesCloned(document);
        }
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
        if (newObj != null) {
            newObj = Object.assign({}, obj)!;

            for (const propName of Object.keys(newObj))
                (newObj as any)[propName] = cloneItem((obj as any)[propName]);
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
