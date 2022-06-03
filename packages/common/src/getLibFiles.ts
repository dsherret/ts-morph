import { libFiles } from "./data/libFiles";
import { errors } from "./errors";
import { StandardizedFilePath } from "./fileSystem";
import { nameof } from "./utils";

/** Gets the TypeScript lib files (.d.ts files). */
export function getLibFiles() {
  return libFiles;
}

/** The folder to use to "store" the in memory lib files. */
export const libFolderInMemoryPath = "/node_modules/typescript/lib" as StandardizedFilePath;

export function getLibFolderPath(options: {
  libFolderPath?: string;
  skipLoadingLibFiles?: boolean;
}) {
  if (options.libFolderPath != null) {
    if (options.skipLoadingLibFiles === true) {
      throw new errors.InvalidOperationError(
        `Cannot set ${nameof(options, "skipLoadingLibFiles")} to true when ${nameof(options, "libFolderPath")} is provided.`,
      );
    }
    return options.libFolderPath;
  }
  return libFolderInMemoryPath;
}
