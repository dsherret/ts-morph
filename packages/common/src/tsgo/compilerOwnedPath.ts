/**
 * Whether the path names a file the compiler carries rather than one on a file system.
 *
 * The default lib files are embedded in the wasm module under a `bundled:///`
 * scheme, and the compiler names them that way in everything it reports — the
 * program's file list, and the declarations a type resolves to. Those are not
 * file system paths: `getStandardizedAbsolutePath` turns one into the nonsense
 * relative path `./bundled:/libs/…`, so nothing may be read, written or resolved
 * for them.
 */
export function isCompilerOwnedPath(path: string) {
  return path.startsWith("bundled:///");
}
