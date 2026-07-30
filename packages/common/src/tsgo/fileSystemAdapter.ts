/**
 * Exposes a ts-morph file system to tsgo.
 *
 * tsgo reads through callbacks rather than touching the disk itself, so pointing
 * it at ts-morph's `TransactionalFileSystem` is enough to have it see in-memory
 * files, pending changes, and the real disk exactly as ts-morph does.
 *
 * No callback here may throw. A callback runs on the wasm host boundary, and an
 * exception crossing it unwinds Go's frames as a trap rather than a panic, which
 * leaves the module permanently dead. `TransactionalFileSystem` throws readily —
 * reading a directory queued for deletion, writing a lib file, or any raw node
 * error such as EACCES — so every entry point below converts a failure into the
 * "nothing there" answer tsgo expects.
 */
import type { FileSystem } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/fs.js";
import type { StandardizedFilePath, TransactionalFileSystem } from "../fileSystem";

export interface FileSystemAdapterOptions {
  /** Encoding used to read files. Defaults to "utf-8". */
  encoding?: string;
}

const NO_ENTRIES = { files: [], directories: [] };

/** Adapts a {@link TransactionalFileSystem} to the file system tsgo expects. */
export function createFileSystemAdapter(
  fileSystem: TransactionalFileSystem,
  options: FileSystemAdapterOptions = {},
): FileSystem {
  const encoding = options.encoding ?? "utf-8";
  const toPath = (path: string) => fileSystem.getStandardizedAbsolutePath(path);

  return {
    fileExists: path => isCompilerOwnedPath(path) ? undefined : tryDo(() => fileSystem.fileExistsSync(toPath(path)), false),
    directoryExists: path => isCompilerOwnedPath(path) ? undefined : tryDo(() => fileSystem.directoryExistsSync(toPath(path)), false),
    // Returning the path unchanged is the identity answer tsgo falls back to.
    realpath: path => isCompilerOwnedPath(path) ? path : tryDo(() => fileSystem.realpathSync(toPath(path)), path),
    // `null` means "does not exist, do not look anywhere else". `undefined`
    // would tell tsgo to fall back to its own base file system, which for a file
    // ts-morph has deleted in memory would read the copy still on disk.
    readFile: path => isCompilerOwnedPath(path) ? undefined : (tryDo(() => fileSystem.readFileIfExistsSync(toPath(path), encoding), undefined) ?? null),
    writeFile: (path, content) => {
      if (!isCompilerOwnedPath(path))
        tryDo(() => fileSystem.writeFileSync(toPath(path), content), undefined);
    },
    getAccessibleEntries: dirPath =>
      isCompilerOwnedPath(dirPath) ? undefined : tryDo(() => {
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
      }, NO_ENTRIES),
  };
}

/**
 * Whether the path names a file the compiler carries rather than one on a file system.
 *
 * The default lib files are embedded in the wasm module under a `bundled:///`
 * scheme, and the compiler names them that way in everything it reports — the
 * program's file list, and the declarations a type resolves to. Those are not file
 * system paths: `getStandardizedAbsolutePath` turns one into the nonsense relative
 * path `./bundled:/libs/…`, so nothing may be read, written or resolved for them.
 *
 * The compiler answers its own bundled paths and does not ask through these
 * callbacks, so the guards below are what keeps that true if it ever does.
 */
export function isCompilerOwnedPath(path: string) {
  return path.startsWith("bundled:///");
}

/** Runs `action`, returning `fallback` if it throws. */
function tryDo<T>(action: () => T, fallback: T): T {
  try {
    return action();
  } catch {
    return fallback;
  }
}

function getEntryName(path: StandardizedFilePath): string {
  const index = path.lastIndexOf("/");
  return index === -1 ? path : path.substring(index + 1);
}
