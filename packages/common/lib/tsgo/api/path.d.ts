/**
 * Returns length of the root part of a path or URL (i.e. length of "/", "x:/", "//server/share/, file:///user/files").
 *
 * For example:
 * ```ts
 * getRootLength("a") === 0                   // ""
 * getRootLength("/") === 1                   // "/"
 * getRootLength("c:") === 2                  // "c:"
 * getRootLength("c:d") === 0                 // ""
 * getRootLength("c:/") === 3                 // "c:/"
 * getRootLength("c:\\") === 3                // "c:\\"
 * getRootLength("//server") === 7            // "//server"
 * getRootLength("//server/share") === 8      // "//server/"
 * getRootLength("\\\\server") === 7          // "\\\\server"
 * getRootLength("\\\\server\\share") === 8   // "\\\\server\\"
 * getRootLength("file:///path") === 8        // "file:///"
 * getRootLength("file:///c:") === 10         // "file:///c:"
 * getRootLength("file:///c:d") === 8         // "file:///"
 * getRootLength("file:///c:/path") === 11    // "file:///c:/"
 * getRootLength("file://server") === 13      // "file://server"
 * getRootLength("file://server/path") === 14 // "file://server/"
 * getRootLength("http://server") === 13      // "http://server"
 * getRootLength("http://server/path") === 14 // "http://server/"
 * ```
 *
 * @internal
 */
export declare function getRootLength(path: string): number;
export declare function getPathComponents(path: string): string[];
/**
 * Determines whether a path has a trailing separator (`/` or `\\`).
 */
export declare function hasTrailingDirectorySeparator(path: string): boolean;
/**
 * Removes a trailing directory separator from a path, if it does not already have one.
 */
export declare function removeTrailingDirectorySeparator(path: string): string;
/**
 * Adds a trailing directory separator to a path, if it does not already have one.
 */
export declare function ensureTrailingDirectorySeparator(path: string): string;
/**
 * Normalize path separators, converting `\\` into `/`.
 */
export declare function normalizeSlashes(path: string): string;
/**
 * Combines paths. If a path is absolute, it replaces any previous path. Relative paths are not simplified.
 */
export declare function combinePaths(path: string, ...paths: (string | undefined)[]): string;
/**
 * Returns the normalized absolute path, resolving `.` and `..` segments.
 */
export declare function getNormalizedAbsolutePath(path: string, currentDirectory: string | undefined): string;
/**
 * Normalizes a path, resolving `.` and `..` segments and converting backslashes to forward slashes.
 */
export declare function normalizePath(path: string): string;
/**
 * Determines whether a path is an absolute disk path (e.g. starts with `/`, or a DOS path
 * like `c:`, `c:\\` or `c:/`).
 */
export declare function isRootedDiskPath(path: string): boolean;
/**
 * Converts a file name to a normalized path.
 *
 * @param fileName The file name to convert
 * @param basePath The base path to use for relative file names
 * @param getCanonicalFileName A function to get the canonical file name (e.g., toLowerCase for case-insensitive systems)
 * @returns The normalized path
 */
export declare function toPath(fileName: string, basePath: string | undefined, getCanonicalFileName: (path: string) => string): string;
/**
 * Creates a getCanonicalFileName function based on case sensitivity.
 */
export declare function createGetCanonicalFileName(useCaseSensitiveFileNames: boolean): (fileName: string) => string;
/**
 * Returns true if the path refers to a bundled library file.
 */
export declare function isBundled(path: string): boolean;
/**
 * Returns true if the file name represents a dynamic/virtual file
 * that doesn't exist on disk (e.g., untitled files with paths like "^/untitled/...").
 */
export declare function isDynamicFileName(fileName: string): boolean;
/**
 * Splits a Windows volume (e.g., "c:") from the rest of the path.
 * Returns [volume, rest, ok] where ok is true if a volume was found.
 */
export declare function splitVolumePath(path: string): [volume: string, rest: string, ok: boolean];
/**
 * Converts a file name to a document URI.
 *
 * @example
 * fileNameToDocumentURI("/path/to/file.ts") === "file:///path/to/file.ts"
 * fileNameToDocumentURI("c:/path/to/file.ts") === "file:///c%3A/path/to/file.ts"
 * fileNameToDocumentURI("^/untitled/ts-nul-authority/Untitled-1") === "untitled:Untitled-1"
 * fileNameToDocumentURI("^/vscode-vfs/github/microsoft/typescript-go/file.ts") === "vscode-vfs://github/microsoft/typescript-go/file.ts"
 */
export declare function fileNameToDocumentURI(fileName: string): string;
/**
 * Converts a document URI to a file name.
 *
 * @example
 * documentURIToFileName("file:///path/to/file.ts") === "/path/to/file.ts"
 * documentURIToFileName("file:///c%3A/path/to/file.ts") === "c:/path/to/file.ts"
 * documentURIToFileName("untitled:Untitled-1") === "^/untitled/ts-nul-authority/Untitled-1"
 * documentURIToFileName("vscode-vfs://github/microsoft/typescript-go/file.ts") === "^/vscode-vfs/github/microsoft/typescript-go/file.ts"
 */
export declare function documentURIToFileName(uri: string): string;
//# sourceMappingURL=path.d.ts.map