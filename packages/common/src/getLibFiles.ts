import { libFiles } from "./data/libFiles";
import { StandardizedFilePath } from "./fileSystem";

/** Gets the TypeScript lib files (.d.ts files). */
export function getLibFiles() {
  return libFiles;
}

/** The folder to use to "store" the lib files. @internal */
export const libFolderInMemoryPath = "/node_modules/typescript/lib" as StandardizedFilePath;
