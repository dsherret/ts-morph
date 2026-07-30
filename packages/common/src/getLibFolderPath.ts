import { errors } from "./errors";
import { nameof } from "./utils";

/**
 * Resolves the folder the compiler reads the default lib files from.
 *
 * Undefined means the compiler uses its own copies, which are embedded in the
 * wasm module; naming a folder makes it read them off the project's file system
 * instead. The two options are reconciled here because they contradict each
 * other: skipping the lib files and naming a folder to read them from cannot
 * both be meant.
 */
export function getLibFolderPath(options: {
  libFolderPath?: string;
  skipLoadingLibFiles?: boolean;
}): string | undefined {
  if (options.libFolderPath != null) {
    if (options.skipLoadingLibFiles === true) {
      throw new errors.InvalidOperationError(
        `Cannot set ${nameof(options, "skipLoadingLibFiles")} to true when ${nameof(options, "libFolderPath")} is provided.`,
      );
    }
    return options.libFolderPath;
  }
  return undefined;
}
