export interface FileSystemEntries {
    files: string[];
    directories: string[];
}
export interface FileSystem {
    directoryExists?: (directoryName: string) => boolean | undefined;
    fileExists?: (fileName: string) => boolean | undefined;
    getAccessibleEntries?: (directoryName: string) => FileSystemEntries | undefined;
    /**
     * Read a file's content.
     * - Return the file content as a `string` (including `""` for empty files).
     * - Return `null` to indicate the file does not exist (without falling back to the real FS).
     * - Return `undefined` to fall back to the real filesystem.
     */
    readFile?: (fileName: string) => string | null | undefined;
    realpath?: (path: string) => string | undefined;
    writeFile?: (path: string, content: string) => void;
    removeFile?: (path: string) => void;
}
/** The callback names supported by the Go server for virtual FS delegation. */
export declare const fsCallbackNames: readonly ["readFile", "fileExists", "directoryExists", "getAccessibleEntries", "realpath", "writeFile"];
export declare function createVirtualFileSystem(files: Record<string, string>): FileSystem;
//# sourceMappingURL=fs.d.ts.map