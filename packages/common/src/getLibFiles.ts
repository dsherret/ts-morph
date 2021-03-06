import * as libFiles from "./data/libFiles";
import { StandardizedFilePath } from "./fileSystem";

/** Gets the lib files. */
export function getLibFiles() {
    // these were previously stored in a different module
    return libFiles.libFiles;
}

/** The folder to use to "store" the lib files. @internal */
export const libFolderInMemoryPath = "/node_modules/typescript/lib" as StandardizedFilePath;
