import { ts, StandardizedFilePath } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { EmitResult } from "./EmitResult";

/**
 * The emitted file in memory.
 */
export interface MemoryEmitResultFile {
    /**
     * File path that was emitted to.
     */
    filePath: StandardizedFilePath;
    /**
     * The text that was emitted.
     */
    text: string;
    /**
     * Whether the byte order mark should be written.
     */
    writeByteOrderMark: boolean;
}

/**
 * Result of an emit to memory.
 */
export class MemoryEmitResult extends EmitResult {
    /**
     * @private
     */
    constructor(context: ProjectContext, compilerObject: ts.EmitResult, private readonly _files: ReadonlyArray<MemoryEmitResultFile>) {
        super(context, compilerObject);
    }

    /**
     * Gets the files that were emitted to memory.
     */
    getFiles() {
        return this._files as MemoryEmitResultFile[]; // assert mutable array
    }

    /**
     * Asynchronously writes the files to the file system.
     */
    saveFiles() {
        const fileSystem = this._context.fileSystemWrapper;
        const promises = this._files.map(f => fileSystem.writeFile(f.filePath, f.writeByteOrderMark ? "\uFEFF" + f.text : f.text));
        return Promise.all(promises);
    }

    /**
     * Synchronously writes the files to the file system.
     * @remarks Use `saveFiles()` as the asynchronous version will be much faster.
     */
    saveFilesSync() {
        const fileSystem = this._context.fileSystemWrapper;
        for (const file of this._files)
            fileSystem.writeFileSync(file.filePath, file.writeByteOrderMark ? "\uFEFF" + file.text : file.text);
    }
}
