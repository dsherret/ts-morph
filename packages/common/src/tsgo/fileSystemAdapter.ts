/**
 * Exposes a ts-morph file system to tsgo.
 *
 * tsgo reads through callbacks rather than touching the disk itself, so pointing
 * it at ts-morph's `TransactionalFileSystem` is enough to have it see in-memory
 * files, pending changes, and the real disk exactly as ts-morph does.
 */
import type { FileSystem } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/fs.js";
import type { StandardizedFilePath, TransactionalFileSystem } from "../fileSystem";

export interface FileSystemAdapterOptions {
  /** Encoding used to read files. Defaults to "utf-8". */
  encoding?: string;
}

/** Adapts a {@link TransactionalFileSystem} to the file system tsgo expects. */
export function createFileSystemAdapter(
  fileSystem: TransactionalFileSystem,
  options: FileSystemAdapterOptions = {},
): FileSystem {
  const encoding = options.encoding ?? "utf-8";
  const toPath = (path: string) => fileSystem.getStandardizedAbsolutePath(path);

  return {
    fileExists: path => fileSystem.fileExistsSync(toPath(path)),
    directoryExists: path => fileSystem.directoryExistsSync(toPath(path)),
    realpath: path => fileSystem.realpathSync(toPath(path)),
    // `undefined` means "not found"; tsgo then falls back to its own lookup.
    readFile: path => fileSystem.readFileIfExistsSync(toPath(path), encoding),
    writeFile: (path, content) => fileSystem.writeFileSync(toPath(path), content),
    getAccessibleEntries: dirPath => {
      const files: string[] = [];
      const directories: string[] = [];
      for (const entry of fileSystem.readDirSync(toPath(dirPath))) {
        const name = getEntryName(entry.path);
        if (entry.isDirectory)
          directories.push(name);
        else
          files.push(name);
      }
      return { files, directories };
    },
  };
}

function getEntryName(path: StandardizedFilePath): string {
  const index = path.lastIndexOf("/");
  return index === -1 ? path : path.substring(index + 1);
}
