import { StandardizedFilePath } from "./fileSystem";

/** Loads the lib files that are stored in a separate module. */
export function getLibFiles() {
  const libFiles: typeof import("./data/libFiles") = require("./data/libFiles");
  return libFiles.libFiles;
}

/** The folder to use to "store" the lib files. @internal */
export const libFolderInMemoryPath = "/node_modules/typescript/lib" as StandardizedFilePath;
